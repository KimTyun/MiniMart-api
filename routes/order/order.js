const express = require('express')
const passport = require('passport')
const { ROLE } = require('../../constants/role')
const { authorize } = require('../../middlewares/middlewares')
const { CartItem, Cart, Item, ItemOption, sequelize, Order, OrderItem } = require('../../models')
const router = express.Router()
require('dotenv').config()

//장바구니에서 주문하기
/*
buyer : user_id || guest,
password,
items : [
            {item_id,item_option_id,count},
            {item_id,item_option_id,count}, ...
        ]
*/
router.post('/', async (req, res, next) => {
   const transaction = await sequelize.transaction()
   try {
      const { buyer, password, items } = req.body

      if (!Array.isArray(items) || items.length === 0) {
         return res.status(400).json({ success: false, message: '주문할 상품이 없습니다.' })
      }
      let hash = null
      if (buyer === 'guest') {
         if (!password) {
            const error = new Error('비회원 주문에는 임시 비밀번호가 필요합니다.')
            error.status = 403
            throw error
         }
         hash = await bcrypt.hash(password, 12)
      }

      const order = await Order.create(
         {
            buyer_id: buyer === 'guest' ? null : buyer,
            status: 'PAID',
            password: hash,
            is_user: buyer === 'guest' ? false : true,
         },
         { transaction }
      )

      await Promise.all(
         items.map((item) =>
            OrderItem.create(
               {
                  item_id: item.item_id,
                  item_option_id: item.item_option_id,
                  order_id: order.id,
                  count: item.count,
               },
               { transaction }
            )
         )
      )
      // 회원의 경우 db의 장바구니 제거(비회원은 react에서 localstoragy 제어)
      if (buyer !== 'guest') {
         await Cart.destroy({
            where: {
               user_id: buyer,
            },
            transaction,
         })
      }

      //주문된 상품들의 개수 줄이기
      await Promise.all(
         items.map(async (item) => {
            const updateItem = await Item.findByPk(item.item_id)
            if (!updateItem) {
               throw new Error(`상품을 찾을 수 없습니다.`)
            }
            if (updateItem.stock_number < item.count) {
               throw new Error('상품 재고가 부족합니다.')
            }
            updateItem.update(
               {
                  stock_number: updateItem.stock_number - item.count,
               },
               { transaction }
            )
         })
      )

      await transaction.commit()

      res.status(201).json({
         success: true,
         message: '성공적으로 주문했습니다.',
         order: {
            id: order.id,
         },
      })
   } catch (error) {
      console.error(error)
      await transaction.rollback()
      error.message = error.message || '장바구니 등록 중 에러발생'
      next(error)
   }
})

// 주문 취소하기
router.delete('/:id', async (req, res, next) => {
   const transaction = await sequelize.transaction()
   try {
      const { id } = req.params
      const order = await Order.findByPk(id, {
         include: [
            {
               model: OrderItem,
            },
         ],
         transaction,
         lock: true,
      })

      if (!order) {
         const error = new Error('주문 정보를 찾을 수 없습니다.')
         error.status = 404
         throw error
      }

      //재고 원상복구
      await Promise.all(
         order.OrderItem.map(async (orderItem) => {
            const item = await Item.findByPk(orderItem.item_id)
            await item.update(
               {
                  stock_number: item.stock_number + orderItem.count,
               },
               { transaction }
            )
         })
      )
      await order.destroy({ transaction })

      await transaction.commit()
      res.json({
         success: true,
         message: '성공적으로 주문 취소함',
      })
   } catch (error) {
      console.error(error)
      await transaction.rollback()
      error.message = error.message || '주문 취소 중 에러발생'
      next(error)
   }
})

//장바구니에 저장 item 과 count가 들어옴
// item - 아이템 아이디와 아이템 옵션 아이디가 들어있음
router.post('/cart', authorize(ROLE.ALL), async (req, res, next) => {
   const transaction = await sequelize.transaction()

   try {
      const { item, count } = req.body
      await Cart.findOrCreate({ where: { user_id: req?.user?.id }, transaction })

      const [cartItem, created] = await CartItem.findOrCreate({
         where: {
            user_id: req?.user?.id,
            item_id: item.item_id,
            item_option_id: item.item_option_id,
         },
         defaults: { count },
         transaction,
      })

      if (!created) {
         await cartItem.update({ count: cartItem.count + count }, { transaction })
      }

      const cart = await Cart.findOne({
         where: {
            user_id: req?.user?.id,
         },
         transaction,
      })
      await transaction.commit()
      res.status(201).json({
         success: true,
         message: '장바구니 담기 성공',
         cart,
      })
   } catch (error) {
      console.error(error)
      await transaction.rollback()
      error.message = error.message || '장바구니 등록 중 에러발생'
      next(error)
   }
})

//장바구니 내용 삭제
//삭제할 품목 (item id, item_iption_id, user_id)
router.delete('/cart', authorize(ROLE.ALL), async (req, res, next) => {
   try {
      const { item_id, item_option_id } = req.body
      if (!item_id || !item_option_id) {
         const error = new Error('삭제할 상품 정보가 누락되었습니다.')
         error.status = 400
         throw error
      }
      const cartItem = await CartItem.findOne({
         where: {
            item_id,
            item_option_id,
            user_id: req.user.id,
         },
      })

      if (!cartItem) {
         const error = new Error('장바구니에서 해당 상품을 찾지 못했습니다.')
         error.status = 404
         throw error
      }

      await cartItem.destroy()
      res.json({
         success: true,
         message: '장바구니에서 해당 상품 삭제 성공',
      })
   } catch (error) {
      console.error(error)
      error.message = error.message || '장바구니에서 상품 삭제 중 에러발생'
      next(error)
   }
})

//장바구니 내용 가져오기
router.get('/cart', authorize(ROLE.ALL), async (req, res, next) => {
   try {
      const cart = await Cart.findByPk(req?.user?.id || 1, {
         include: [
            {
               model: CartItem,
               include: [
                  {
                     model: Item,
                     attributes: ['name', 'price'],
                  },
                  {
                     model: ItemOption,
                     attributes: ['name', 'price'],
                  },
               ],
            },
         ],
      })

      if (!cart) {
         res.status(404).json({
            success: false,
            message: '장바구니 없음',
            cart: null,
         })
      }

      res.json({
         success: true,
         message: '장바구니 불러오기 완료',
         cart,
      })
   } catch (error) {
      console.error(error)
      error.message = error.message || '장바구니 불러오는중 에러발생'
      next(error)
   }
})

module.exports = router
