require('dotenv').config()
const GoogleStrategy = require('passport-google-oauth20').Strategy
const User = require('../models/user')
const passport = require('passport')

module.exports = () => {
   passport.use(
      new GoogleStrategy(
         {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
            passReqToCallback: true,
         },
         async (req, accessToken, refreshToken, profile, done) => {
            // 사용자 DB 조회/등록 로직
            try {
               const existingUser = await User.findOne({
                  where: {
                     provider: 'GOOGLE',
                     provider_id: profile.id,
                  },
               })

               if (existingUser) {
                  return done(null, existingUser)
               }
               const newUser = await User.create({
                  email: profile?.emails[0]?.value,
                  provider_id: profile.id,
                  name: profile.displayName,
                  profile_img: profile?.photos[0]?.value,
                  provider: 'GOOGLE',
                  role: 'BUYER',
               })
               return done(null, newUser)
            } catch (error) {
               console.log('strategy에서의 오류 : ', error)
               return done(error)
            }
         }
      )
   )
}
