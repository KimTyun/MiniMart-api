const passport = require('passport')
const google = require('./googleStrategy')
const local = require('./localStrategy')
const User = require('../models/user')

module.exports = () => {
   passport.serializeUser((user, done) => {
      done(null, user.id)
   })
   passport.deserializeUser(async (id, done) => {
      try {
         const user = await User.findByPk(id)
         done(null, user) // req.user로 들어감
      } catch (error) {
         done(error)
      }
   })
   local() //localStrategy.js 파일의 함수를 실행해 Passport에 local을 추가
   google()
}
