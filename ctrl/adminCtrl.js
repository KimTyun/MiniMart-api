const { sequelize, User, Seller, Order, OrderItem } = require('../models')
const moment = require('moment')

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
   } catch (error) {
      console.error(error)
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
   } catch (error) {
      console.error(error)
      res.status(500).json({ message: '승인 대기 목록 조회 실패' })
   }
}

// 승인 거절
exports.rejectSeller = async (req, res) => {
   try {
      const sellerId = req.params.id
      await Seller.update({ status: 'REJECTED' }, { where: { id: sellerId } })
      res.json({ message: '판매자 거절 완료' })
   } catch (error) {
      console.error(error)
      res.status(500).json({ message: '판매자 거절 실패' })
   }
}

// 고객 통계 월별 가입자
exports.getMonth = async (req, res) => {
   try {
      const startDate = moment({ year: year, month: month - 1, day: 1 })
         .startOf('day')
         .toDate()
      const endDate = moment({ year: year, month: month - 1 })
         .endOf('month')
         .endOf('day')
         .toDate()

      const orders = await User.findAll({
         where: {
            createdAt: {
               [Sequelize.Op.between]: [startDate, endDate],
            },
         },
      })
      return orders
   } catch (error) {
      console.error(error)
      res.status(500).json({ message: '월별 데이터 가져오기 실패' })
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

// 주문 목록 가져오기
exports.getAllOrders = async (req, res) => {
   try {
      const orders = await Order.findAll({
         include: [
            {
               model: OrderItem,
               attributes: ['createdAt', 'count'],
            },
            {
               model: User,
               attributes: ['name', 'email', 'address', 'phone_number'],
            },
         ],
      })
      res.json(orders)
   } catch (error) {
      console.error(error)
      res.status(500).json({ message: '주문 목록 조회 실패' })
   }
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
