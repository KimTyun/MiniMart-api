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
const fs = require('fs')
// 라우터 등록

const authRouter = require('./routes/auth/auth')
const itemRouter = require('./routes/item/item')
const mypageRouter = require('./routes/my/mypage')
const filesRouter = require('./routes/bizFile/files')
const searchRouter = require('./routes/item/search')
const followRouter = require('./routes/follow')
const sellerRouter = require('./routes/seller')
const qnaRouter = require('./routes/qna')
const cartRouter = require('./routes/cart')
const app = express()
passportConfig()
initPassport()

app.set('PORT', process.env.PORT || 8000)

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

// uploads 폴더가 없을 경우 새로 생성
try {
   fs.readdirSync('uploads') //해당 폴더가 있는지 확인
} catch (error) {
   console.log('uploads 폴더가 없어 uploads 폴더를 생성합니다.')
   fs.mkdirSync('uploads') //폴더 생성
}

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
         secure: false,
      },
   }),
   passport.initialize(),
   passport.session()
)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.get('/', (req, res) => {
   res.send(`
      <h1>서버 정상 작동중.</h1>
      http://localhost:${app.get('PORT')}`)
})

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// 라우터 연결
app.use('/auth', authRouter)
app.use('/item', itemRouter)
app.use('/mypage', mypageRouter)
app.use('/api/item', itemRouter)
app.use('/api/item/search', searchRouter)
app.use('/auth/seller', sellerRouter)
app.use('/api/follow', followRouter)
app.use('/api/seller', sellerRouter)
app.use('/auth/seller', sellerRouter)
app.use('/api/qna', qnaRouter)
app.use('/files', filesRouter)
app.use('/admin', require('./routes/auth/admin'))
app.use('/api/cart', cartRouter)

app.use((err, req, res, next) => {
   const statusCode = err.status || 500
   const errorMessage = err.message || '서버 내부 오류'
   if (process.env.NODE_ENV === 'development') {
      return res.status(statusCode).json({
         success: false,
         message: errorMessage,
         stack: err.stack, // 스택 트레이스 추가
         error: err,
      })
   }
   if (process.env.NODE_ENV === 'development') {
      console.log(err)
   }

   res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: err,
   })
})

// 서버 실행
app.listen(app.get('PORT'), () => {
   console.log(`http://localhost:${app.get('PORT')} express 실행
   http://localhost:${app.get('PORT')}/api-docs api 확인하기`)
})
