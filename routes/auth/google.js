const express = require('express')
const passport = require('passport')
const router = express.Router()
require('dotenv').config()

// 로그인 시작
router.get('/login', passport.authenticate('google', { scope: ['profile', 'email'], prompt: 'select_account' }))

// 콜백 처리
router.get('/callback', passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_APP_URL}?error=google_login_failed'` }), (req, res) => {
   res.redirect(`${process.env.FRONTEND_APP_URL}`)
})
module.exports = router
