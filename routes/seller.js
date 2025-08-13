// =================================================================

// 파일 4: /routes/seller.js 파일을 새로 만듭니다.
const express = require('express')
const router = express.Router()
const sellerCtrl = require('../ctrl/sellerCtrl')

// GET /api/seller/:sellerId/items - 특정 판매자의 상품 목록 조회
router.get('/:sellerId/items', sellerCtrl.getItemsBySeller)

module.exports = router
