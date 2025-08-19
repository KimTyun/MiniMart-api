const express = require('express')
const router = express.Router()
const sellerCtrl = require('../ctrl/sellerCtrl')
const { authorize } = require('../middlewares/middlewares')
const { ROLE } = require('../constants/role')
const { Seller } = require('../models')
const { registerSeller } = require('../ctrl/authCtrl')
const { isLoggedIn } = require('../middlewares/middlewares')

// GET /api/seller/:sellerId/items - 특정 판매자의 상품 목록 조회
router.get('/:sellerId/items', sellerCtrl.getItemsBySeller)
// 판매자 등록
router.post('/register', isLoggedIn, registerSeller)
// 판매자 조회
router.get('/seller', sellerCtrl.getSeller)

router.put('/update', authorize(ROLE.SELLER), async (req, res, next) => {
   try {
      const { id, name, introduce, phone_number } = req.body

      const seller = await Seller.findByPk(id)
      if (!seller) {
         const error = new Error('정보를 찾을 수 없습니다.')
         error.status = 404
         throw error
      }
      await seller.update({
         name,
         introduce,
         phone_number,
      })

      res.json({
         success: true,
         message: '수정됨',
      })
   } catch (error) {
      error.message = error.message || '수정 중 에러 발생'
      error.status = error.status || 500
      next(error)
   }
})

module.exports = router
