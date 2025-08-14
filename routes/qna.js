const express = require('express')
const router = express.Router()
const path = require('path')
const fs = require('fs')
const multer = require('multer')
const { QnaBoard, QnaBoardImg } = require('../models')
const qnaCtrl = require('../ctrl/qnaCtrl')
const upload = require('../middlewares/upload')
const { authorize } = require('../middlewares/middlewares')
const { ROLE } = require('../constants/role')

// 업로드 폴더 없으면 생성
const uploadPath = path.join(__dirname, '../uploads/qna-images')
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

const uploadQnaImages = multer({ storage, fileFilter })

// GET /api/qna - Q&A 목록 조회
router.get('/', qnaCtrl.getQnas)

// POST /api/qna - Q&A 생성 (이미지 업로드 포함)
router.post('/', authorize(ROLE.USER), uploadQnaImages.array('images', 5), qnaCtrl.createQna)

module.exports = router
