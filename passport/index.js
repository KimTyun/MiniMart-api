const passport = require('passport')
const google = require('./googleStrategy')
const User = require('../models/user')
module.exports = () => {
   passport.serializeUser((user, done) => {
      done(null, user.id)
   })
   passport.deserializeUser(async (id, done) => {
      try {
         const user = await User.findbyId(id)
         done(null, user) // req.user로 들어감
      } catch (error) {
         done(error)
      }
   })

   google()
}
