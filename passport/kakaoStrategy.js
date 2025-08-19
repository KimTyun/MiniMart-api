const KakaoStrategy = require('passport-kakao').Strategy
const User = require('../models/user')

module.exports = () => {
   const passport = require('passport')

   passport.use(
      new KakaoStrategy(
         {
            clientID: process.env.KAKAO_REST_API_KEY,
            callbackURL: process.env.KAKAO_REDIRECT_URI,
         },
         async (accessToken, refreshToken, profile, done) => {
            try {
               console.log('카카오 프로필:', profile.id)

               // 사용자 DB 조회/등록 로직
               let existingUser = await User.findOne({
                  where: {
                     provider: 'KAKAO',
                     provider_id: profile.id.toString(),
                  },
               })

               if (existingUser) {
                  console.log('기존 사용자 로그인:', existingUser.id)
                  return done(null, existingUser)
               }

               const kakaoAccount = profile._json.kakao_account

               // 핸드폰 번호 정리
               let phoneNumber = kakaoAccount.phone_number || null
               if (phoneNumber) {
                  phoneNumber = phoneNumber
                     .replace(/\+82\s?/, '0') // +82를 0으로 변경
                     .replace(/-/g, '') // 하이픈 제거
                     .replace(/\s/g, '') // 공백 제거
               }

               // 나이 계산 (한국식)
               let age = null
               if (kakaoAccount.birthyear) {
                  const currentYear = new Date().getFullYear()
                  age = currentYear - parseInt(kakaoAccount.birthyear, 10) + 1
               }

               const newUser = await User.create({
                  name: kakaoAccount.profile?.nickname || '카카오유저',
                  email: kakaoAccount.email || `kakao_${profile.id}@temp.email`, // 임시 이메일
                  password: null, // 소셜 로그인은 비밀번호 비공개
                  address: null,
                  phone_number: phoneNumber,
                  provider_id: profile.id.toString(),
                  profile_img: kakaoAccount.profile?.profile_image_url || null,
                  provider: 'KAKAO',
                  role: 'BUYER',
                  age: age,
               })

               console.log('새 사용자 생성:', newUser.id)
               return done(null, newUser)
            } catch (error) {
               console.error('카카오 Strategy 에러:', error)
               return done(error, null)
            }
         }
      )
   )
}
