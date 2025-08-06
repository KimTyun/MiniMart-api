const express = require('express')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const router = express.Router()

// JWT 인증 미들웨어
function verifyToken(req, res, next) {
   try {
      const authHeader = req.headers.authorization
      if (!authHeader) return res.status(401).json({ message: '토큰이 없습니다.' })

      const token = authHeader.split(' ')[1] // Bearer token
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.user = decoded
      next()
   } catch (err) {
      return res.status(403).json({ message: '유효하지 않은 토큰입니다.' })
   }
}

// ✅ 카카오 로그인 URL 전달 (매번 로그인 강제)
router.get('/', (req, res) => {
   const kakaoAuthURL = `https://kauth.kakao.com/oauth/authorize?response_type=code` + `&client_id=${process.env.KAKAO_REST_API_KEY}` + `&redirect_uri=${process.env.KAKAO_REDIRECT_URI}` + `&prompt=login` // ← 매번 로그인 강제
   res.json({ url: kakaoAuthURL })
})

// ✅ 카카오 인증 후 Redirect 처리 (fetch 사용)
router.get('/callback', async (req, res) => {
   const { code } = req.query

   try {
      // 1. 액세스 토큰 요청
      const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
         method: 'POST',
         headers: { 'Content-type': 'application/x-www-form-urlencoded;charset=utf-8' },
         body: new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: process.env.KAKAO_REST_API_KEY,
            redirect_uri: process.env.KAKAO_REDIRECT_URI,
            code,
         }),
      })
      const tokenData = await tokenRes.json()
      const { access_token } = tokenData

      // 2. 사용자 정보 요청
      const userRes = await fetch('https://kapi.kakao.com/v2/user/me', {
         headers: { Authorization: `Bearer ${access_token}` },
      })
      const userData = await userRes.json()

      const kakaoAccount = userData.kakao_account
      const profile = kakaoAccount.profile

      // 3. JWT 토큰 발급 (닉네임 포함)
      const jwtToken = jwt.sign(
         {
            id: userData.id,
            email: kakaoAccount.email,
            name: profile.nickname,
         },
         process.env.JWT_SECRET,
         { expiresIn: '1h' }
      )

      // 4. 프론트엔드로 토큰 전달
      res.redirect(`http://localhost:5173/login/success?token=${jwtToken}`)
   } catch (err) {
      console.error(err)
      res.status(500).json({ message: '카카오 로그인 실패' })
   }
})

// ✅ 로그인된 사용자 정보 반환
router.get('/me', verifyToken, (req, res) => {
   res.json({
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
   })
})

module.exports = router
