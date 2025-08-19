const express = require('express')
const router = express.Router()
const { registerSeller } = require('../../ctrl/authCtrl')
const { isLoggedIn } = require('../../middlewares/middlewares')

router.post('/register', isLoggedIn, registerSeller)

module.exports = router
