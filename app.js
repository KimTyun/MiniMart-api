const cookieParser = require('cookie-parser')
const express = require('express')
const session = require('express-session')
const morgan = require('morgan')
const path = require('path')
const { sequelize } = require('./models')
require('dotenv').config()
const cors = require('cors')

const app = express()

app.set('PORT', process.env.PORT || 8000)

sequelize
   .getQueryInterface()
   .dropAllTables({ cascade: true })
   .then(() => {
      return sequelize.sync({ force: true })
   })
   .then(() => {
      console.log('DB 강제 초기화 완료 (외래키 무시)')
   })
   .catch(console.error)

app.use(
   cors({
      origin: 'http://localhost:5173', // 특정 주소만 request 허용
      credentials: true, // 쿠키, 세션 등 인증 정보 허용
   }),
   morgan('dev'),
   express.static(path.join(__dirname, 'uploads')),
   express.json(),
   express.urlencoded({ extended: false }),
   cookieParser(/*process.env.SECRET_KEY*/),
   session({
      resave: false,
      saveUninitialized: true,
      secret: process.env.SECRET_KEY,
      cookie: {
         httpOnly: true,
         signed: false,
         secure: false,
      },
   })
)

app.listen(app.get('port'), () => {
   console.log(app.get('port'), '번 포트에서 대기중')
})
