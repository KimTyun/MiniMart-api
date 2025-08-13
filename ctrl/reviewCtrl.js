const path = require('path')
const fs = require('fs')
const multer = require('multer')
const { ItemReview } = require('../models')

// 업로드 폴더 없으면 생성
const uploadPath = path.join(__dirname, '../uploads/review-images')
if (!fs.existsSync(uploadPath)) {
   fs.mkdirSync(uploadPath, { recursive: true })
}

// multer 설정
const storage = multer.diskStorage({
   destination: (req, file, cb) => {
      cb(null, uploadPath)
   },
   filename: (req, file, cb) => {
      const ext = path.extname(file.originalname)
      const filename = `${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`
      cb(null, filename)
   },
})

const fileFilter = (req, file, cb) => {
   const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
   if (allowed.includes(file.mimetype)) {
      cb(null, true)
   } else {
      cb(new Error('이미지 파일만 업로드 가능합니다.'), false)
   }
}

const uploadReviewImage = multer({ storage, fileFilter })

// 리뷰 작성
exports.createReview = async (req, res) => {
   try {
      const { buyer_id, seller_id, content, rating } = req.body
      let imgPath = null

      if (req.file) {
         imgPath = `/uploads/review-images/${req.file.filename}`
      }

      if (!buyer_id || !seller_id || !content || !rating) {
         return res.status(400).json({ message: '필수 항목을 모두 입력하세요.' })
      }

      const review = await ItemReview.create({
         buyer_id,
         seller_id,
         content,
         rating,
         img: imgPath,
      })

      res.status(201).json({ message: '리뷰가 등록되었습니다.', review })
   } catch (err) {
      console.error(err)
      res.status(500).json({ message: '서버 에러' })
   }
}

exports.uploadReviewImage = uploadReviewImage
