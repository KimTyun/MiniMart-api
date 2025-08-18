const { QnaBoard, QnaBoardImg, User } = require('../models')

// Q&A 등록
exports.createQna = async (req, res, next) => {
   const { title, content, isSecret } = req.body
   const userId = req.user.id // 로그인 미들웨어를 통해 얻은 사용자 ID

   try {
      // 1. QnaBoard에 텍스트 데이터 저장
      const qna = await QnaBoard.create({
         title,
         content,
         is_secret: isSecret === 'true', // 프론트에서 문자열로 넘어오므로 변환
         user_id: userId,
      })

      // 2. 이미지가 있으면 QnaBoardImg에 이미지 URL 저장
      if (req.files && req.files.length > 0) {
         const images = req.files.map((file) => ({
            img_url: `/uploads/${file.filename}`, // 클라이언트에서 접근할 경로
            qna_id: qna.id,
         }))
         await QnaBoardImg.bulkCreate(images)
      }

      res.status(201).json({ success: true, message: '질문이 성공적으로 등록되었습니다.' })
   } catch (error) {
      console.error(error)
      next(error)
   }
}

// Q&A 목록 조회
exports.getQnas = async (req, res, next) => {
   try {
      const qnas = await QnaBoard.findAll({
         include: [
            { model: User, attributes: ['name'] }, // 작성자 이름 포함
            { model: QnaBoardImg, attributes: ['img_url'] }, // 이미지 포함
         ],
         order: [['createdAt', 'DESC']],
      })
      res.status(200).json({ success: true, data: qnas })
   } catch (error) {
      console.error(error)
      next(error)
   }
}
