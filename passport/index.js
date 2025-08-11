const passport = require('passport')

const google = require('./googleStrategy')
const kakao = require('./kakaoStrategy')

const local = require('./localStrategy')
const User = require('../models/user')

module.exports = () => {
   //직렬화(serializeUser): 로그인 성공 후 사용자 정보를 세션에 저장
   passport.serializeUser((user, done) => {
      // user: 사용자 정보가 저장되어 있는 객체
      done(null, user.id) //사용자 id(pk값)를 세션에 저장(세션 용량 절약을 위해 id만 저장)
   })

   passport.deserializeUser(async (id, done) => {
      try {
         console.log('로그인 확인')
         const user = await User.findByPk(id)
         done(null, user) // req.user로 들어감
      } catch (error) {
         done(error)
      }
   })
   local() //localStrategy.js 파일의 함수를 실행해 Passport에 local을 추가
   google()
   kakao()
}
