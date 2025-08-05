const express = require('express')
const router = express.Router()

const google = require('./google')
const kakao = require('./kakao')
const local = require('./local')

router.use('/google', google)
router.use('/kakao', kakao)
router.use('/local', local)

module.exports = router
