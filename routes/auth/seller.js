// routes/auth/seller.js (새로 만들거나 기존에 추가)
const express = require('express')
const router = express.Router()
const { registerSeller } = require('../../ctrl/authCtrl')
const { isLoggedIn } = require('../../middlewares/middlewares')

router.post('/register', isLoggedIn, registerSeller)

module.exports = router
