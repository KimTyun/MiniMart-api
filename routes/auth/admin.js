const express = require('express')
const router = express.Router()
const { getPendingSellers, approveSeller, rejectSeller } = require('../../ctrl/adminCtrl')
const { isAdmin } = require('../../middlewares/middlewares')

router.get('/sellers/pending', isAdmin, getPendingSellers)
router.post('/sellers/approve/:id', isAdmin, approveSeller)
router.post('/sellers/reject/:id', isAdmin, rejectSeller)

module.exports = router
