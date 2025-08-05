const cookieParser = require('cookie-parser')
const express = require('express')
const session = require('express-session')
const morgan = require('morgan')
const path = require('path')
const { sequelize } = require('./models')
require('dotenv').config()
const passportConfig = require('./passport')
const cors = require('cors')
const swaggerUi = require('swagger-ui-express')
const swaggerSpec = require('./swagger')
const passport = require('passport')
const initPassport = require('./passport/googleStrategy')

const authRouter = require('./routes/auth/auth')


const app = express()
passportConfig()

app.set('port', process.env.PORT || 8000)

// 테이블 재생성 코드(테이블 변경사항이 없을 경우 주석처리)
// sequelize
//    .getQueryInterface()
//    .dropAllTables({ cascade: true })
//    .then(() => {
//       return sequelize.sync({ force: true })
//    })
//    .then(() => {
//       console.log('DB 강제 초기화 완료 (외래키 무시)')
//    })
//    .catch(console.error)

app.use(
   cors({
      origin: 'http://localhost:5173', // 특정 주소만 request 허용
      credentials: true, // 쿠키, 세션 등 인증 정보 허용
   }),
   morgan('dev'),
   express.static(path.join(__dirname, 'uploads')),
   express.json(),
   express.urlencoded({ extended: false }),
   cookieParser(process.env.COOKIE_SECRET),
   session({
      resave: false,
      saveUninitialized: true,
      secret: process.env.COOKIE_SECRET,
      cookie: {
         httpOnly: true,
         signed: true,
         secure: true,
      },
   }),
   passport.initialize(),
   passport.session()
)

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.use('/auth', authRouter)

app.listen(app.get('PORT'), () => {
   console.log(`http://localhost:${app.get('PORT')} express 실행`)

})
