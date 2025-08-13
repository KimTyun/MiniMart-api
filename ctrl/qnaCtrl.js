const path = require('path')
const fs = require('fs')
const multer = require('multer')
const { QnaBoard, QnaBoardImg } = require('../models') // QnaBoardImg 모델 추가

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

exports.createQna = async (req, res) => {
   try {
      const { title, content, isSecret } = req.body
      const user_id = req.user.id // 가정: `req.user`에 사용자 정보가 있음
      const is_public = isSecret === 'false' // ⭐ 비밀글(isSecret)이 아니면 공개글(is_public)

      // 필수 항목 확인
      if (!user_id || !title || !content) {
         return res.status(400).json({ message: '필수 항목을 모두 입력하세요.' })
      }

      // QnaBoard에 먼저 질문 저장
      const newQna = await QnaBoard.create({
         user_id,
         title,
         q_content: content, // ⭐ content를 q_content에 매핑
         is_public,
      })

      if (req.files && req.files.length > 0) {
         const imagePromises = req.files.map((file) => {
            const imgPath = `/uploads/qna-images/${file.filename}`
            return QnaBoardImg.create({
               qna_board_id: newQna.id,
               img_path: imgPath,
            })
         })
         await Promise.all(imagePromises)
      }

      res.status(201).json({ message: '질문이 등록되었습니다.', qna: newQna })
   } catch (err) {
      console.error(err)
      // 오류 발생 시 업로드된 파일 삭제 (선택적)
      if (req.files) {
         req.files.forEach((file) => {
            fs.unlink(file.path, (unlinkErr) => {
               if (unlinkErr) console.error('Failed to delete uploaded file:', unlinkErr)
            })
         })
      }
      res.status(500).json({ message: '서버 에러', error: err.message })
   }
}

// ⭐ exports 이름 변경
exports.uploadQnaImages = uploadQnaImages
