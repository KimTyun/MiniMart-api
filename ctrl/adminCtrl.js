const { sequelize, User, Seller, Order, OrderItem } = require('../models')
const { Sequelize } = require('sequelize')
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
      console.log('쿼리 파라미터:', req.query)
      const { year, month } = req.query

      const yearNum = parseInt(year, 10)
      const monthNum = parseInt(month, 10)

      if (isNaN(yearNum) || isNaN(monthNum)) {
         return res.status(400).json({ message: '올바른 year, month 값을 입력하세요.' })
      }

      const startDate = moment({ year: yearNum, month: monthNum - 1, day: 1 })
         .startOf('day')
         .toDate()

      const endDate = moment({ year: yearNum, month: monthNum - 1 })
         .endOf('month')
         .endOf('day')
         .toDate()

      const users = await User.findAll({
         where: {
            createdAt: {
               [Sequelize.Op.between]: [startDate, endDate],
            },
         },
         attributes: ['id', 'age'],
      })

      const ageGroups = { 10: 0, 20: 0, 30: 0, 40: 0, 50: 0, '60+': 0 }

      users.forEach((user) => {
         if (!user.age) return
         const age = parseInt(user.age, 10)

         if (age < 20) ageGroups['10']++
         else if (age < 30) ageGroups['20']++
         else if (age < 40) ageGroups['30']++
         else if (age < 50) ageGroups['40']++
         else if (age < 60) ageGroups['50']++
         else ageGroups['60+']++
      })

      const result = Object.keys(ageGroups).map((key) => ({
         name: `${key}대`,
         value: ageGroups[key],
      }))

      res.json(result)
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

// 주문 삭제
exports.deleteOrder = async (req, res) => {
   try {
      const id = req.params.id

      const order = await Order.findByPk(id)
      console.log('order = ', order)
      console.log('id = ', id)

      if (!order) {
         const error = new Error('주문을 찾을 수 없습니다.')
         error.status = 404
         console.error(error)
      }

      await order.destroy({ force: true })

      res.json({
         success: true,
         message: '주문이 성공적으로 취소되었습니다.',
      })
   } catch (error) {
      console.error(error)
      res.status(500).json({ message: '상품 삭제 실패' })
   }
}

exports.answerQna = (req, res) => {
   res.send('문의 답변')
}
