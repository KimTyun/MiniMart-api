const express = require('express')
const router = express.Router()
const qnaCtrl = require('../../ctrl/qnaCtrl')

router.post('/', qnaCtrl.uploadQnaImages.array('images', 5), qnaCtrl.createQna)

module.exports = router
