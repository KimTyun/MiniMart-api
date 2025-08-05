const express = require('express')
const google = require('./auth_google')

const router = express.Router()

router.use('/google', google)
// router.use(카카오)
// router.use(로컬)

module.exports = router
