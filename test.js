require('dotenv').config()
console.log('DB_DEV_NAME:', process.env.DB_DEV_NAME) // 값 나오나 확인

const env = process.env.NODE_ENV || 'development'
const config = require('./config/config.js')[env]
console.log('config:', config)
console.log('config.database:', config.database)
