const express = require('express')
const router = express.Router()
const { getPendingSellers, approveSeller, rejectSeller, getMonth, getAllOrders, deleteOrder } = require('../../ctrl/adminCtrl')
const { isAdmin } = require('../../middlewares/middlewares')

router.get('/sellers/pending', isAdmin, getPendingSellers)
router.post('/sellers/approve/:id', isAdmin, approveSeller)
router.post('/sellers/reject/:id', isAdmin, rejectSeller)
router.get('/user/month', isAdmin, getMonth)
router.get('/orders', isAdmin, getAllOrders)
router.post('/orders/delete/:id', isAdmin, deleteOrder)

module.exports = router
