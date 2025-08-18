const express = require('express')
const router = express.Router()

const { getPendingSellers, approveSeller, rejectSeller, getYear, getAllOrders, getQnaList, answerQna, deleteOrder } = require('../../ctrl/adminCtrl')

const { isAdmin } = require('../../middlewares/middlewares')

router.get('/sellers/pending', isAdmin, getPendingSellers)
router.post('/sellers/approve/:id', isAdmin, approveSeller)
router.post('/sellers/reject/:id', isAdmin, rejectSeller)
router.get('/user/year', isAdmin, getYear)
router.get('/orders', isAdmin, getAllOrders)
router.get('/qna', isAdmin, getQnaList)
router.put('/qna/:qnaId/answer', isAdmin, answerQna)
router.post('/orders/delete/:id', isAdmin, deleteOrder)

module.exports = router
