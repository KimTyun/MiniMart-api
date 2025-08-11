const express = require('express')
const passport = require('passport')
const router = express.Router()
require('dotenv').config()

/**
 * @swagger
 * /auth/google/login:
 *   get:
 *     summary: 구글 로그인 시작
 *     description: 사용자를 구글 로그인 페이지로 리디렉션합니다.
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: 구글 로그인 페이지로 리디렉션됩니다.
 */
router.get(
   '/login',
   passport.authenticate('google', {
      scope: ['profile', 'email'],
      prompt: 'select_account',
   })
)

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: 구글 로그인 콜백 처리
 *     description: 구글 로그인 성공 시 메인페이지로 리디렉션 됩니다., 실패 시 에러 페이지로 이동합니다.
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: 로그인 성공 시 프론트엔드의 메인페이지로 리디렉션됩니다. 실패 시 에러 쿼리와 함께 리디렉션됩니다. user 객체를 반환하지 않기 때문에 프론트엔드에서 로그인 세션 존재 여부를 다시 확인해야 합니다.
 */
router.get('/callback', passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_APP_URL}?error=google_login_failed'` }), (req, res) => {
   console.log('[passport] 구글 로그인 성공, 사용자:', req.user)
   res.redirect(`${process.env.FRONTEND_APP_URL}/login/success/google`)
})
module.exports = router

router.post('/setcookie', (req, res, next) => {
   try {
      res.cookie('myInfoConfig', 'myInfoConfig', {
         httpOnly: true,
         secure: false,
         sameSite: 'lax',
         maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      res.json({ message: '쿠키 설정 완료' })
   } catch (error) {
      console.log(error)
      error.message = '쿠키 설정중 에러발생'
      next(error)
   }
})

router.get('/checkcookie', (req, res) => {
   const myInfoConfig = req.cookies.myInfoConfig
   if (!myInfoConfig) {
      return res.json({ expired: true, message: '쿠키없음' })
   } else {
      return res.json({ expired: false, message: '쿠키있음' })
   }
})
