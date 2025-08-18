const { sequelize, User, Seller, Order, OrderItem, QnaBoard, QnaBoardImg } = require('../models')
const { Op } = require('sequelize')

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

// 고객 나이별 가입자 (올해)
exports.getYear = async (req, res) => {
   try {
      const yearNum = new Date().getFullYear()

      // 1월 1일 ~ 12월 31일 범위
      const startDate = moment({ year: yearNum, month: 0, day: 1 }).startOf('day').toDate()
      const endDate = moment({ year: yearNum, month: 11, day: 31 }).endOf('day').toDate()

      // 해당 연도 가입자 조회
      const users = await User.findAll({
         where: {
            createdAt: {
               [Op.between]: [startDate, endDate],
            },
         },
         attributes: ['id', 'age'],
      })

      const ageGroups = { 10: 0, 20: 0, 30: 0, 40: 0, 50: 0, '60+': 0 }

      users.forEach((user) => {
         const age = parseInt(user.age, 10)

         if (!Number.isInteger(age) || age <= 0 || age > 120) return

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
      res.status(500).json({ message: '나이별 데이터 가져오기 실패' })
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

// 모든 Q&A 목록 가져오기
exports.getQnaList = async (req, res) => {
   try {
      const qnaList = await QnaBoard.findAll({
         include: [
            {
               model: User,
               as: 'Questions',
               attributes: ['id', 'name', 'email'],
            },
            {
               model: QnaBoardImg,
               attributes: ['img'],
            },
         ],
         order: [['createdAt', 'DESC']],
      })
      res.status(200).json(qnaList)
   } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Q&A 목록 조회에 실패했습니다.' })
   }
}

// 문의에 답변 등록 및 수정
exports.answerQna = async (req, res) => {
   try {
      const { qnaId } = req.params
      const { a_content, adminId } = req.body

      if (!a_content || a_content.trim() === '') {
         return res.status(400).json({ message: '답변 내용을 입력해주세요.' })
      }

      const qna = await QnaBoard.findByPk(qnaId)

      if (!qna) {
         return res.status(404).json({ message: '해당 문의를 찾을 수 없습니다.' })
      }

      await qna.put({
         a_content: a_content,
         admin_id: adminId,
      })

      res.status(200).json({ message: '답변이 성공적으로 등록되었습니다.', data: qna })
   } catch (error) {
      console.error(error)
      res.status(500).json({ message: '답변 등록 중 오류가 발생했습니다.' })
   }
}
