const express = require('express')
const google = require('./auth_google')
const kakao = require('./auth_kakao')

const router = express.Router()

router.use('/google', google)
router.use('/kakao', kakao)
// router.use(로컬)

module.exports = router
