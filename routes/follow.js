// =================================================================

// 파일 3: /routes/follow.js 파일을 새로 만듭니다.
const express = require('express')
const router = express.Router()
const { isLoggedIn } = require('../middlewares/middlewares')
const followCtrl = require('../ctrl/followCtrl')

// GET /api/follow/sellers - 내가 팔로우하는 판매자 목록 조회
router.get('/sellers', isLoggedIn, followCtrl.getFollowingSellers)

module.exports = router
