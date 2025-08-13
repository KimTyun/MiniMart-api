const { sequelize, User, Seller } = require('../models')

// 판매자 자격 승인
exports.approveSeller = async (req, res) => {
   const t = await sequelize.transaction()
   try {
      const sellerId = req.params.id

      const seller = await Seller.findByPk(sellerId, { transaction: t })
      if (!seller) {
         await t.rollback()
         return res.status(404).json({ message: '판매자를 찾을 수 없습니다.' })
      }

      await seller.update({ status: 'APPROVED' }, { transaction: t })
      await User.update({ role: 'SELLER' }, { where: { id: sellerId }, transaction: t })

      await t.commit()
      res.json({ message: '판매자 승인 완료' })
   } catch (err) {
      console.error(err)
      await t.rollback()
      res.status(500).json({ message: '판매자 승인 실패' })
   }
}
// 승인 보류
exports.getPendingSellers = async (req, res) => {
   try {
      const sellers = await Seller.findAll({
         where: { status: 'PENDING' },
         include: [{ model: User, attributes: ['id', 'name', 'email'] }],
      })
      res.json(sellers)
   } catch (err) {
      console.error(err)
      res.status(500).json({ message: '승인 대기 목록 조회 실패' })
   }
}

// 승인 거절
exports.rejectSeller = async (req, res) => {
   try {
      const sellerId = req.params.id
      await Seller.update({ status: 'REJECTED' }, { where: { id: sellerId } })
      res.json({ message: '판매자 거절 완료' })
   } catch (err) {
      console.error(err)
      res.status(500).json({ message: '판매자 거절 실패' })
   }
}

exports.getAllUsers = (req, res) => {
   res.send('사용자 전체 목록')
}

exports.editUserInfo = (req, res) => {
   res.send('사용자 정보 수정')
}

exports.deleteUser = (req, res) => {
   res.send('사용자 삭제')
}

exports.getAllOrders = (req, res) => {
   res.send('주문 전체 목록')
}

exports.editOrderInfo = (req, res) => {
   res.send('주문 수정(관리자)')
}

exports.deleteOrder = (req, res) => {
   res.send('주문 삭제(관리자)')
}

exports.answerQna = (req, res) => {
   res.send('문의 답변')
}
