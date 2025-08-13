const express = require('express')
const router = express.Router()
const { authorize } = require('../../middlewares/middlewares')
const { ROLE } = require('../../constants/role')
const { Item, ItemOption, ItemImg, Hashtag, Seller, Order, OrderItem, User } = require('../../models')
const { Op } = require('sequelize')
const { sequelize } = require('../../models')
const fs = require('fs')
const multer = require('multer')
const path = require('path')
const { where } = require('sequelize')
const { count } = require('console')

console.log('Item model name:', Item?.name, 'table:', Item?.getTableName?.())
console.log('ItemImg model name:', ItemImg?.name, 'table:', ItemImg?.getTableName?.())

//upload/item 폴더가 없을 경우 생성
try {
   fs.readdirSync('uploads/item') //해당 폴더가 있는지 확인
} catch (error) {
   console.log('item 폴더가 없어 생성합니다.')
   fs.mkdirSync('uploads/item') //폴더 생성
}

// multer 설정
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
 * name , price, stock_number description, status, is_sale, sale options([{name, price, rep_item_yn}]), img, hashtags[tag1,tag2,tag3]
 * img : 상제정보 이미지
 * rep_img : 대표이미지
 * imgs : 상품 이미지들
 */
router.post(
   '/',
   /*authorize(ROLE.SELLER),*/ upload.fields([
      { name: 'imgs', maxCount: 4 }, // 상품 이미지
      { name: 'img', maxCount: 1 }, // 상품 상세설명 이미지
      { name: 'rep_img', maxCount: 1 }, //상품 대표 이미지
   ]),
   async (req, res, next) => {
      const transaction = await sequelize.transaction()
      try {
         if (!req.files || !req.files['imgs'] || req.files['imgs'].length === 0 || !req.files['img'] || req.files['img'].length === 0 || !req.files['rep_img']) {
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
               is_sale: is_sale === 'true' || false,
               sale: Number(sale) || 0,
               seller_id: null /*req?.user?.id */, //완성 후 수정 필요(seller아이디 없을 시 에러)
            },
            { transaction }
         )

         const parsedOptions = typeof options === 'string' ? JSON.parse(options) : options

         // 아이템 옵션도 db에 추가
         const newItemOptions = await Promise.all(
            parsedOptions.map((option, index) => {
               return ItemOption.create(
                  {
                     item_id: newItem.id,
                     name: option.name,
                     price: option.price,
                     rep_item_yn: index === 0,
                  },
                  { transaction }
               )
            })
         )

         // 아이템 이미지도 db에 추가
         await Promise.all(
            req.files['imgs'].map((file, index) =>
               ItemImg.create(
                  {
                     item_id: newItem.id,
                     img_url: file.location || `/uploads/item/${file.filename}`,
                  },
                  { transaction }
               )
            )
         )
         //상세설정 이미지 따로 추가
         await ItemImg.create(
            {
               item_id: newItem.id,
               img_url: req.files['img'][0].location || `/uploads/item/${req.files['img'][0].filename}`,
               details_img_yn: true,
            },
            { transaction }
         )
         //대표 이미지도 따로 추가
         await ItemImg.create(
            {
               item_id: newItem.id,
               img_url: req.files['rep_img'][0].location || `/uploads/item/${req.files['rep_img'][0].filename}`,
               rep_img_yn: true,
            },
            { transaction }
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
   }
)

// 최근 상품 조회
router.get('/recent', async (req, res, next) => {
   try {
      const items = await Item.findAll({
         include: [
            {
               model: ItemImg,
               where: { rep_img_yn: true },
               required: false,
               attributes: ['id', 'img_url', 'rep_img_yn'],
            },
            {
               model: Seller,
               attributes: ['id', 'name'],
            },
         ],
         attributes: ['id', 'name', 'price', 'stock_number', 'status', 'createdAt'],
         order: [['createdAt', 'DESC']],
         limit: 3,
      })

      res.json({
         success: true,
         message: '최근 상품 불러오기 성공',
         count: items.length,
         items,
      })
   } catch (error) {
      console.error('GET /item/recent error =>', error)
      error.status = error.status || 500
      error.message = error.message || '최근 상품을 불러오는중 오류 발생'
      next(error)
   }
})

// 인기 상품 조회(20대, 30대)
router.get('/popular/age', async (req, res, next) => {
   try {
      const topByAge = async (minAge, maxAge, tag) => {
         const rows = await Item.findAll({
            attributes: ['id', 'name'], // Item 기준
            include: [
               { model: Seller, attributes: ['id', 'name'] },
               {
                  model: ItemImg,
                  attributes: ['id', 'img_url'],
                  where: { rep_img_yn: true },
                  required: false, // 대표 이미지 없을 수도
               },
               {
                  model: ItemOption,
                  attributes: [],
                  required: true,
                  include: [
                     {
                        model: OrderItem,
                        attributes: [],
                        required: true,
                        include: [
                           {
                              model: Order,
                              attributes: [],
                              required: true,
                              include: [
                                 {
                                    model: User,
                                    attributes: [],
                                    required: true,
                                    where: { age: { [Op.between]: [minAge, maxAge] } },
                                 },
                              ],
                           },
                        ],
                     },
                  ],
               },
            ],
            // ONLY_FULL_GROUP_BY 대응: SELECT에 나오는 애들 전부 GROUP BY
            group: ['Item.id', 'Item.name', 'Seller.id', 'Seller.name', 'ItemImgs.id', 'ItemImgs.img_url'],
            // col()/fn() 안 쓰고 literal로 합계 정렬
            order: [
               [sequelize.literal('SUM(`ItemOptions->OrderItem`.`count`)'), 'DESC'], // ← 단수
               [sequelize.literal('`Item`.`id`'), 'ASC'],
            ],

            limit: 1,
            subQuery: false,
            raw: false,
         })

         if (!rows || rows.length === 0) return null

         const it = rows[0]
         return {
            age_group: tag,
            item_name: it.name ?? null,
            seller_name: it.Seller?.name ?? null,
            rep_img_url: it.ItemImgs?.[0]?.img_url ?? null,
         }
      }

      const result20s = await topByAge(20, 29, '20s')
      const result30s = await topByAge(30, 39, '30s')

      const items = [result20s, result30s].filter(Boolean)

      res.json({
         success: true,
         message: '연령대별 인기 상품 불러오기 성공',
         count: items.length,
         items, // [{ age_group, item_name, seller_name, rep_img_url }]
      })
   } catch (error) {
      console.error('GET /item/popular/by-age error =>', error)
      error.status = error.status || 500
      error.message = error.message || '연령대별 인기 상품을 불러오는 중 오류 발생'
      next(error)
   }
})

//상품 수정 (item 수정/ item_option 수정/ item_img수정/ hashtag 수정)
/*
name, price, stock_number, description, status, is_sale, sale, options, hashtags, deleteImg, imgs, img 데이터가 담겨와야 합니다.
options는 option 객체({name,price,rep_item_yn})가 담겨있는 배열, 
hashtags는 hashtag가 담겨있는 배열, 
deleteImg는 삭제할 이미지의 아이디가 담겨있는 배열 입니다.
*/
router.put(
   '/:itemId',
   authorize(ROLE.SELLER),
   upload.fields([
      { name: 'imgs', maxCount: 4 }, // imgs는 여러개 가능
      { name: 'img', maxCount: 1 }, // img는 1개만
      { name: 'rep_img', maxCount: 1 },
   ]),
   async (req, res, next) => {
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
                     rep_item_yn: option.rep_item_yn || false,
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
            req.files['imgs'].map((file) =>
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
   }
)

//상품 삭제
router.delete('/:itemId', authorize(ROLE.SELLER | ROLE.ADMIN), async (req, res, next) => {
   const transaction = await sequelize.transaction()
   try {
      const { itemId } = req.params
      const item = await Item.findByPk(itemId)
      if (!item) {
         const error = new Error('상품정보를 찾을 수 없습니다.')
         error.status = 404
         throw error
      }
      await Item.destroy({ where: { id: itemId }, transaction })
      await ItemOption.destroy({ where: { item_id: itemId }, transaction })

      const itemImg = await ItemImg.findAll({ where: { item_id: itemId } })
      await ItemImg.destroy({ where: { item_id: itemId }, transaction })

      if (itemImg) {
         itemImg.map((img) => {
            const filePath = path.join(__dirname, '../..', img.img_url)
            if (fs.existsSync(filePath)) {
               fs.unlinkSync(filePath)
            }
         })
      }
      await sequelize.models.item_hashtag.destroy({
         where: { item_id: itemId },
         transaction,
      })
      await transaction.commit()

      res.json({
         success: true,
         message: '성공적으로 상품을 삭제했습니다.',
         itemImg,
      })
   } catch (error) {
      await transaction.rollback()
      error.status = error.status || 500
      error.message = error.message || '상품을 삭제하는 중 오류 발생'
      next(error)
   }
})

// 단일상품 조회(상품 상제정보)
router.get('/:itemId', async (req, res, next) => {
   try {
      const { itemId } = req.params
      const item = await Item.findByPk(itemId, {
         include: [
            {
               model: Hashtag,
               through: { attributes: [] },
            },
            {
               model: ItemImg,
            },
            {
               model: ItemOption,
            },
            {
               model: Seller,
               attributes: ['id', 'name'],
               include: [
                  {
                     model: User,
                     attributes: ['id', 'profile_img'],
                  },
               ],
            },
         ],
      })

      if (!item) {
         const error = new Error('상품을 찾을 수 없습니다.')
         error.status = 404
         throw error
      }
      res.json({
         item,
         success: true,
         message: '성공적으로 상품 정보를 불러왔습니다.',
      })
   } catch (error) {
      error.status = error.status || 500
      error.message = error.message || '상품 정보를 불러오는중 오류 발생'
      next(error)
   }
})

// 판매자 기준으로 상품 조회
router.get('/seller/:sellerId', async (req, res, next) => {
   try {
      const { sellerId } = req.params
      const seller = await Seller.findByPk(sellerId)
      if (!seller) {
         const error = new Error('판매자 정보를 찾을 수 없습니다.')
         error.status = 404
         throw error
      }
      const items = await Item.findAll({
         where: { seller_id: sellerId },
         limit: 5,
         include: [
            {
               model: ItemImg,
               where: {
                  rep_img_yn: true,
               },
            },
         ],
      })
      if (!items) {
         const error = new Error('해당 판매자의 상품을 찾을 수 없습니다.')
         error.status = 404
         throw error
      }

      res.status(200).json({
         success: true,
         message: '성공적으로 판매자 상품 목록을 불러왔습니다.',
         items,
      })
   } catch (error) {
      error.status = error.status || 500
      error.message = error.message || '상품 정보를 불러오는중 오류 발생'
      next(error)
   }
})

module.exports = router
