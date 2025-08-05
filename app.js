const cookieParser = require('cookie-parser')
const express = require('express')
const session = require('express-session')
const morgan = require('morgan')
const path = require('path')
const { sequelize } = require('./models')
require('dotenv').config()
const cors = require('cors')
const swaggerUi = require('swagger-ui-express')
const swaggerSpec = require('./swagger')

const app = express()

app.set('port', process.env.PORT || 8000)

sequelize
   .sync({ force: true })
   .then(() => {
      console.log('db연결성공')
   })
   .catch((e) => {
      console.error(e)
   })

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

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.listen(app.get('port'), () => {
   console.log(app.get('port'), '번 포트에서 대기중')
})
