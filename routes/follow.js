const express = require('express')
const router = express.Router()
const { isLoggedIn } = require('../middlewares/middlewares') // 로그인 검사
const followCtrl = require('../ctrl/followCtrl')

// POST /api/follow/seller/:sellerId - 판매자 팔로우
router.post('/seller/:sellerId', isLoggedIn, followCtrl.followSeller)

// DELETE /api/follow/seller/:sellerId - 판매자 언팔로우
router.delete('/seller/:sellerId', isLoggedIn, followCtrl.unfollowSeller)

// GET /api/follow/home - 홈 화면에 보여줄 내 팔로잉 목록
router.get('/home', isLoggedIn, followCtrl.getFollowingSellersForHome)

module.exports = router
