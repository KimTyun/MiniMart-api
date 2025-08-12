const express = require('express')
const axios = require('axios')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const router = express.Router()
const { isLoggedIn } = require('../../middlewares/middlewares')
const User = require('../../models/user') // 경로 확인

// 1. 카카오 로그인 URL 생성
router.get('/', (req, res) => {
   const kakaoAuthURL = `https://kauth.kakao.com/oauth/authorize?response_type=code` + `&client_id=${process.env.KAKAO_REST_API_KEY}` + `&redirect_uri=${process.env.KAKAO_REDIRECT_URI}` + `&prompt=login` + `&scope=profile_image,birthyear,phone_number`
   res.json({ url: kakaoAuthURL })
})

// 2. 카카오 인증 후 Redirect 처리
router.get('/callback', async (req, res) => {
   const { code } = req.query
   try {
      // 1. 액세스 토큰 요청
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

      // 2. 사용자 정보 요청
      const userRes = await axios.get('https://kapi.kakao.com/v2/user/me', {
         headers: { Authorization: `Bearer ${access_token}` },
      })

      const kakaoId = userRes.data.id
      const kakaoAccount = userRes.data.kakao_account

      // 3. DB에서 카카오 계정 찾기
      let user = await User.findOne({
         where: { provider: 'KAKAO', provider_id: kakaoId },
      })

      // 4. 없으면 새로 생성
      if (!user) {
         // 핸드폰 번호 계산
         let phoneNumber = kakaoAccount.phone_number || null
         if (phoneNumber) {
            // "+82 10-1234-5678" → "01012345678"
            phoneNumber = phoneNumber
               .replace(/\+82\s?/, '0')
               .replace(/-/g, '')
               .replace(/\s/g, '')
         }
         // 나이 계산
         let age = null
         if (kakaoAccount.birthyear) {
            const currentYear = new Date().getFullYear()
            age = currentYear - parseInt(kakaoAccount.birthyear, 10) + 1 // 한국식 나이
         }

         user = await User.create({
            name: kakaoAccount.profile?.nickname || '카카오유저',
            email: kakaoAccount.email || `${kakaoId}@kakao.temp`, // 이메일 없으면 가짜로 생성
            password: null, // 소셜 로그인은 비밀번호 없음
            address: null,
            phone_number: phoneNumber,
            provider_id: kakaoId,
            profile_img: kakaoAccount.profile?.profile_image_url || null,
            provider: 'KAKAO',
            role: 'BUYER', // 기본 구매자
            age: age,
         })
      }

      // 5. JWT 발급
      const payload = {
         id: user.id,
         name: user.name,
         email: user.email,
         address: user.address,
         phone_number: user.phone_number,
         profile_img: user.profile_img,
         role: user.role,
      }
      const jwtToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' })

      // 6. 프론트로 전달
      res.redirect(`http://localhost:5173/login/success?token=${jwtToken}`)
   } catch (err) {
      console.error('카카오 로그인 에러:', err)
      res.status(500).json({ error: '카카오 로그인 실패', detail: err.message })
   }
})

// 3. 사용자 정보 조회 API
router.get('/me', isLoggedIn, (req, res) => {
   const { id, name, email, address, phone_number, profile_img, role } = req.user
   res.json({
      id,
      name,
      email,
      address,
      phone_number,
      profile_img,
      role,
   })
})

module.exports = router
