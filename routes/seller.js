const express = require('express')
const router = express.Router()
const sellerCtrl = require('../ctrl/sellerCtrl')
const { registerSeller } = require('../ctrl/authCtrl')
const { isLoggedIn } = require('../middlewares/middlewares')

// GET /api/seller/:sellerId/items - 특정 판매자의 상품 목록 조회
router.get('/:sellerId/items', sellerCtrl.getItemsBySeller)
// 판매자 등록
router.post('/register', isLoggedIn, registerSeller)
// 판매자 조회
router.get('/seller', sellerCtrl.getSeller)

module.exports = router
