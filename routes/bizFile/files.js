// routes/files.js (또는 routes/bizFile/files.js)
const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { isLoggedIn } = require('../../middlewares/middlewares') // ← 위치에 맞게 조정 (routes에 있으면 ../, bizFile에 있으면 ../../)

const router = express.Router()

// ✅ 업로드 디렉토리: 프로젝트 루트/uploads/certificates
// files.js가 어디에 있든 루트 기준으로 고정
const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads', 'certificates')

const storage = multer.diskStorage({
   destination: (req, file, cb) => {
      try {
         fs.mkdirSync(UPLOAD_DIR, { recursive: true }) // 폴더 없으면 생성
         cb(null, UPLOAD_DIR)
      } catch (e) {
         cb(e)
      }
   },
   filename: (req, file, cb) => {
      const ext = path.extname(file.originalname)
      const base = path.basename(file.originalname, ext)
      const safeBase = base.replace(/[^\w.-]/g, '_')
      cb(null, `${Date.now()}_${safeBase}${ext}`)
   },
})

const fileFilter = (req, file, cb) => {
   if (file.mimetype.startsWith('image/')) cb(null, true)
   else cb(new Error('이미지 파일만 허용됩니다.'), false)
}

const upload = multer({
   storage,
   fileFilter,
   limits: { fileSize: 5 * 1024 * 1024 },
})

router.post('/upload', isLoggedIn, upload.single('file'), (req, res) => {
   if (!req.file) {
      return res.status(400).json({ message: '파일이 없습니다.' })
   }
   // 정적 경로와 매칭되는 URL 생성
   const url = `${req.protocol}://${req.get('host')}/uploads/certificates/${req.file.filename}`
   return res.status(201).json({ url })
})

module.exports = router
