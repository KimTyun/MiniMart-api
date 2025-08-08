const express = require('express')
const router = express.Router()
const { authorize } = require('../../middlewares/middlewares')
const { ROLE } = require('../../constants/role')
const { Item, ItemOption, ItemImg, Hashtag } = require('../../models')
const { sequelize } = require('../../models')
const fs = require('fs')
const multer = require('multer')
const path = require('path')

try {
   fs.readdirSync('uploads/item') //해당 폴더가 있는지 확인
} catch (error) {
   console.log('item 폴더가 없어 생성합니다.')
   fs.mkdirSync('uploads/item') //폴더 생성
}

const upload = multer({
   storage: multer.diskStorage({
      destination(req, file, cb) {
         cb(null, 'uploads/item/')
      },
      filename(req, file, cb) {
         const decodedFileName = decodeURIComponent(file.originalname)
         const ext = path.extname(decodedFileName)
         const basename = path.basename(decodedFileName, ext)
         cb(null, basename + Date.now() + ext)
      },
   }),
   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB로 제한
})

//상품 등록, 삭제, 수정
//상품 조회 : 상품 단일조회(상세정보), 상품 다수조회(조건)

//상품 등록
/**
 * name , price, stock_number description, status, is_sale, sale options([{name, price, req_item_yn}]), img, hashtags[tag1,tag2,tag3]
 */
router.post('/', /*authorize(ROLE.SELLER),*/ upload.array('img'), async (req, res, next) => {
   const transaction = await sequelize.transaction()
   try {
      if (!req.files || req.files.length === 0) {
         const error = new Error('상품 이미지를 최소 1개는 업로드 해야 합니다.')
         error.status = 400
         throw error
      }

      const { name, price, stock_number, description, status, is_sale, sale, options, hashtags } = req.body

      // Item db에 추가
      const newItem = await Item.create(
         {
            name,
            price,
            stock_number,
            description,
            status: status || 'FOR_SALE',
            is_sale: is_sale || false,
            sale: sale || 0,
         },
         { transaction }
      )

      const parsedOptions = typeof options === 'string' ? JSON.parse(options) : options

      // 아이템 옵션도 db에 추가
      const newItemOptions = await Promise.all(
         parsedOptions.map((option) => {
            return ItemOption.create(
               {
                  item_id: newItem.id,
                  name: option.name,
                  price: option.price,
                  req_item_yn: option.req_item_yn || false,
               },
               { transaction }
            )
         })
      )

      // 아이템 이미지도 db에 추가
      await Promise.all(
         req.files.map((file) =>
            ItemImg.create(
               {
                  item_id: newItem.id,
                  img_url: file.location || `/uploads/item/${file.filename}`,
               },
               { transaction }
            )
         )
      )

      const parsedHashtags = typeof hashtags === 'string' ? JSON.parse(hashtags) : hashtags

      // 해시태그도 추가
      if (parsedHashtags) {
         const hashtagInstances = await Promise.all(
            parsedHashtags.map((hashtag) => {
               return Hashtag.findOrCreate({
                  where: { content: hashtag },
                  transaction,
               }).then(([instance]) => instance)
            })
         )
         await newItem.addHashtags(hashtagInstances, { transaction })
      }

      //모두 추가하는데 문제가 없었으면 추가한 내용 commit하고 완료
      await transaction.commit()
      res.status(201).json({
         success: true,
         message: '성공적으로 상품이 등록되었습니다.',
         item: {
            ...newItem.get({ plain: true }),
            options: newItemOptions,
         },
      })
   } catch (error) {
      console.error(error)
      await transaction.rollback()
      error.status = error.status || 500
      error.message = error.message || '상품 등록 중 문제 발생'
      next(error)
   }
})

//상품 수정 (item 수정/ item_option 수정/ item_img수정/ hashtag 수정)
/*
name, price, stock_number, description, status, is_sale, sale, options, hashtags, deleteImg, img 데이터가 담겨와야 합니다.
options는 option 객체({name,price,req_item_yn})가 담겨있는 배열, 
hashtags는 hashtag가 담겨있는 배열, 
deleteImg는 삭제할 이미지의 아이디가 담겨있는 배열 입니다.
*/
router.put('/:itemId', authorize(ROLE.SELLER), upload.array('img'), async (req, res, next) => {
   const transaction = await sequelize.transaction()
   try {
      const { itemId } = req.params
      const item = await Item.findByPk(itemId)
      if (!item) {
         console.error(error)
         await transaction.rollback()
         const error = new Error('상품을 찾을 수 없습니다.')
         error.status = 404
         throw error
      }
      const { name, price, stock_number, description, status, is_sale, sale, options, hashtags, deleteImg } = req.body

      await item.update(
         {
            name,
            price,
            stock_number,
            description,
            status,
            is_sale,
            sale,
         },
         { transaction }
      )

      //아이템 옵션 지우기
      await ItemOption.destroy({ where: { item_id: itemId }, transaction })
      //아이템 옵션 새로생성
      const parsedOptions = typeof options === 'string' ? JSON.parse(options) : options
      await Promise.all(
         parsedOptions.map((option) => {
            return ItemOption.create(
               {
                  item_id: item.id,
                  name: option.name,
                  price: option.price,
                  req_item_yn: option.req_item_yn || false,
               },
               { transaction }
            )
         })
      )

      //해시태그 연결 해제
      await item.setHashtags([], { transaction })

      //새로 해시태그 설정
      const parsedHashtags = typeof hashtags === 'string' ? JSON.parse(hashtags) : hashtags

      if (parsedHashtags) {
         const hashtagInstances = await Promise.all(
            parsedHashtags.map((hashtag) => {
               return Hashtag.findOrCreate({
                  where: { content: hashtag },
                  transaction,
               }).then(([instance]) => instance)
            }),
            { transaction }
         )
         await item.addHashtags(hashtagInstances, { transaction })
      }

      const parsedDeleteImg = typeof deleteImg === 'string' ? JSON.parse(deleteImg) : deleteImg

      // 기존 이미지 중 지울 이미지만 db에서 제거한 뒤 이미지 파일도 제거
      if (deleteImg && deleteImg.length > 0) {
         await Promise.all(
            parsedDeleteImg.map(async (img_id) => {
               const img = await ItemImg.findByPk(img_id)
               if (img) {
                  ItemImg.destroy({ where: { id: img_id }, transaction })
                  const filePath = path.join(__dirname, '../..', img.img_url)
                  if (fs.existsSync(filePath)) {
                     fs.unlinkSync(filePath)
                  }
               }
            })
         )
      }
      //새로 넣은 이미지 추가
      await Promise.all(
         req.files.map((file) =>
            ItemImg.create(
               {
                  item_id: item.id,
                  img_url: file.location || `/uploads/item/${file.filename}`,
               },
               { transaction }
            )
         )
      )

      await transaction.commit()
      res.status(200).json({
         success: true,
         message: '성공적으로 상품 수정이 완료되었습니다.',
      })
   } catch (error) {
      console.log(error)
      await transaction.rollback()
      error.status = error.status || 500
      error.message = error.message || '상품 수정중 오류 발생'
      next(error)
   }
})

//상품 삭제
router.delete('/:itemId', authorize(ROLE.SELLER | ROLE.ADMIN), (req, res, next) => {
   console.log('상품삭제 api 요청 잘 왔음.')
   res.send('상품삭제 api 요청 잘 왔음.')
})

// 단일상품 조회(상품 상제정보)
router.get('/:itemId', authorize(ROLE.ALL), (req, res, next) => {
   console.log('단일상품조회 api 요청 잘 왔음.')
   res.send('단일상품조회 api 요청 잘 왔음.')
})

module.exports = router
