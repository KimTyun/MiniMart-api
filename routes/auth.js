const express = require('express')
const axios = require('axios')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const router = express.Router()

// 1. 카카오 로그인 URL 생성
router.get('/kakao', (req, res) => {
   const kakaoAuthURL = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${process.env.KAKAO_REST_API_KEY}&redirect_uri=${process.env.KAKAO_REDIRECT_URI}`
   res.redirect(kakaoAuthURL)
})

// 2. 카카오 인증 후 Redirect 처리
router.get('/kakao/callback', async (req, res) => {
   const { code } = req.query
   try {
      // 액세스 토큰 요청
      const tokenRes = await axios.post('https://kauth.kakao.com/oauth/token', null, {
         params: {
            grant_type: 'authorization_code',
            client_id: process.env.KAKAO_REST_API_KEY,
            redirect_uri: process.env.KAKAO_REDIRECT_URI,
            code,
         },
         headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
         },
      })

      const { access_token } = tokenRes.data

      // 사용자 정보 요청
      const userRes = await axios.get('https://kapi.kakao.com/v2/user/me', {
         headers: {
            Authorization: `Bearer ${access_token}`,
         },
      })

      const kakaoAccount = userRes.data.kakao_account
      const payload = {
         id: userRes.data.id,
         nickname: kakaoAccount.profile.nickname,
         email: kakaoAccount.email,
      }

      // JWT 발급
      const jwtToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' })

      // 프론트엔드로 JWT 전달 (Query string)
      res.redirect(`http://localhost:5173/login/success?token=${jwtToken}`)
   } catch (err) {
      console.error(err)
      res.status(500).json({ error: '카카오 로그인 실패' })
   }
})

module.exports = router
