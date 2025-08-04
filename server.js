const app = require('./app')
const dotenv = require('dotenv')
const { sequelize } = require('./models')
const swaggerUi = require('swagger-ui-express')
const swaggerSpec = require('./swagger')

dotenv.config()

const PORT = process.env.PORT || 8000
sequelize.sync({ alter: true })
sequelize
   .sync({ force: false })
   .then(() => console.log('✅DB 연결 및 테이블 준비 완료'))
   .catch((err) => console.error('❌DB 연결 실패:', err))

app.listen(PORT, () => {
   console.log(`✅http://localhost:${PORT}에서 서버 대기 중`)
})

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
