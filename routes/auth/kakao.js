const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router()
const { isLoggedIn } = require('../../middlewares/middlewares')
const passport = require('passport')

// 1. 카카오 로그인 URL 생성
router.get('/', (req, res) => {
   const kakaoAuthURL = `https://kauth.kakao.com/oauth/authorize?response_type=code` + `&client_id=${process.env.KAKAO_REST_API_KEY}` + `&redirect_uri=${process.env.KAKAO_REDIRECT_URI}` + `&prompt=login` + `&scope=profile_image,birthyear,phone_number`

   res.json({ url: kakaoAuthURL })
})

// 2. 카카오 인증 후 Redirect 처리
router.get(
   '/callback',
   passport.authenticate('kakao', {
      failureRedirect: '/login?error=kakao_auth_failed',
      session: true,
   }),
   async (req, res) => {
      try {
         // req.user -> 사용자 정보
         const user = req.user

         // JWT 토큰 발급
         const payload = {
            id: user.id,
            name: user.name,
            email: user.email,
            address: user.address,
            phone_number: user.phone_number,
            profile_img: user.profile_img,
            role: user.role,
         }

         const jwtToken = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '24h', // 토큰 24시간
         })

         // 프론트엔드로 리다이렉트
         res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login/success?token=${jwtToken}`)
      } catch (err) {
         console.error('카카오 로그인 콜백 에러:', err)
         res.redirect('/login?error=server_error')
      }
   }
)

// 3. 사용자 정보 조회 API
router.get('/me', isLoggedIn, (req, res) => {
   try {
      const { id, name, email, address, phone_number, profile_img, role } = req.user
      res.json({
         success: true,
         user: {
            id,
            name,
            email,
            address,
            phone_number,
            profile_img,
            role,
         },
      })
   } catch (err) {
      console.error('사용자 정보 조회 에러:', err)
      res.status(500).json({
         success: false,
         error: '사용자 정보를 가져올 수 없습니다.',
      })
   }
})

module.exports = router
