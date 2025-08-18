const { QnaBoard, QnaBoardImg, User } = require('../models')

exports.createQna = async (req, res, next) => {
   const { title, content, isSecret } = req.body
   const userId = req.user.id

   try {
      const qna = await QnaBoard.create({
         title,
         content,
         is_secret: isSecret === 'true',
         user_id: userId,
      })

      if (req.files && req.files.length > 0) {
         const images = req.files.map((file) => ({
            img_url: `/uploads/${file.filename}`,
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

exports.getQnas = async (req, res, next) => {
   try {
      const qnas = await QnaBoard.findAll({
         include: [
            { model: User, attributes: ['name'] },
            { model: QnaBoardImg, attributes: ['img_url'] },
         ],
         order: [['createdAt', 'DESC']],
      })
      res.status(200).json({ success: true, data: qnas })
   } catch (error) {
      console.error(error)
      next(error)
   }
}
