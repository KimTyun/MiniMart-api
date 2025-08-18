const multer = require('multer')
const path = require('path')
const fs = require('fs')

// uploads 폴더가 없으면 생성
try {
   fs.readdirSync('uploads')
} catch (error) {
   console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.')
   fs.mkdirSync('uploads')
}

const upload = multer({
   storage: multer.diskStorage({
      destination(req, file, cb) {
         cb(null, 'uploads/') // 저장될 폴더
      },
      filename(req, file, cb) {
         const ext = path.extname(file.originalname) // 확장자
         cb(null, path.basename(file.originalname, ext) + Date.now() + ext) // 파일명 중복 방지
      },
   }),
   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB 제한
})

module.exports = upload
