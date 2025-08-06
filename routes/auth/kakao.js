const express = require('express')
const axios = require('axios')
const jwt = require('jsonwebtoken')
const router = express.Router()
const { isLoggedIn } = require('../../middlewares/middlewares')

router.get('/', (req, res) => {
   const kakaoAuthURL = `https://kauth.kakao.com/oauth/authorize?response_type=code` + `&client_id=${process.env.KAKAO_REST_API_KEY}` + `&redirect_uri=${process.env.KAKAO_REDIRECT_URI}` + `&prompt=login` // ← 매번 로그인 강제
   res.json({ url: kakaoAuthURL })
})

// 2. 카카오 인증 후 Redirect 처리
router.get('/callback', async (req, res) => {
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

// 3. 사용자 정보 조회 API
router.get('/me', isLoggedIn, (req, res) => {
   // isLoggedIn 미들웨어에서 검증 후 req.user에 저장된 정보를 반환
   const { id, nickname, email } = req.user
   res.json({
      id,
      nickname,
      email,
   })
})

// 4. 로그아웃 API
router.post('/logout', (req, res) => {
   // 프론트에서 토큰 삭제하도록 지시
   res.json({ message: '로그아웃 성공, 로컬 토큰 삭제하세요.' })
})

module.exports = router
