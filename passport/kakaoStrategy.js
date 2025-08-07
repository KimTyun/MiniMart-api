const KakaoStrategy = require('passport-kakao').Strategy
const User = require('../models/user')
const passport = require('passport')

module.exports = () => {
   passport.use(
      new KakaoStrategy(
         {
            clientID: process.env.KAKAO_REST_API_KEY,
            callbackURL: process.env.KAKAO_REDIRECT_URI,
         },
         async (profile, done) => {
            try {
               const existingUser = await User.findOne({
                  where: {
                     provider: 'KAKAO',
                     provider_id: profile.id.toString(),
                  },
               })

               if (existingUser) {
                  return done(null, existingUser)
               }

               const kakaoAccount = profile._json.kakao_account
               const newUser = await User.create({
                  name: kakaoAccount.profile?.nickname || null,
                  email: kakaoAccount.email || null,
                  password: null,
                  address: null,
                  phone_number: kakaoAccount.phone_number || null,
                  provider_id: profile.id.toString(),
                  profile_img: kakaoAccount.profile?.profile_image_url || null,
                  provider: 'KAKAO',
                  role: 'BUYER',
                  age: kakaoAccount.birthyear ? new Date().getFullYear() - parseInt(kakaoAccount.birthyear) : null,
               })
               return done(null, newUser)
            } catch (error) {
               console.log('Kakao strategy error:', error)
               return done(error)
            }
         }
      )
   )
}
