const express = require('express')
const router = express.Router()
const cartCtrl = require('../ctrl/cartCtrl')
const { authorize } = require('../middlewares/middlewares') // 로그인 확인 미들웨어
const { ROLE } = require('../constants/role')

router.get('/', authorize(ROLE.USER), cartCtrl.getCart)

router.post('/', authorize(ROLE.USER), cartCtrl.addToCart)

router.delete('/:cartId', authorize(ROLE.USER), cartCtrl.removeFromCart)

module.exports = router
