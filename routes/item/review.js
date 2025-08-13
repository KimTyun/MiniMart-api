const express = require('express')
const router = express.Router()
const reviewCtrl = require('../../ctrl/reviewCtrl')

// 리뷰 작성 (multer 미들웨어 사용)
router.post('/', reviewCtrl.uploadReviewImage.single('img'), reviewCtrl.createReview)

module.exports = router
