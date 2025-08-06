const express = require('express')
const router = express.Router()
const { isLoggedIn } = require('./middlewares')
const reviewCtrl = require('../ctrl/reviewCtrl')

// item_review.js에선 상품의 리뷰 목록 조회, 등록, 수정과 삭제를 담당합니다.

// ✅ 상품 상세 페이지 - 리뷰
/**
 * @swagger
 * /reviews/product/{productId}:
 *   get:
 *     summary: 상품 리뷰 목록 조회
 *     tags: [Review]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: "가져올 리뷰 개수 (예: 3)"
 *     responses:
 *       200:
 *         description: 리뷰 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   rating:
 *                     type: number
 *                   reviewTitle:
 *                     type: string
 *                   authorProfileUrl:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date
 *                   content:
 *                     type: string
 *       404:
 *         description: 상품을 찾을 수 없습니다
 */
router.get('/product/:productId' /* reviewCtrl.getReviewsByProduct */)

// ✅ 특정 상품의 리뷰 목록 조회
/**
 * @swagger
 * /products/{productId}/reviews:
 *   get:
 *     summary: 상품 리뷰 목록 조회
 *     tags: [Review]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: "리뷰 목록을 조회할 상품의 ID"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 리뷰 목록 조회 성공
 *       404:
 *         description: 상품을 찾을 수 없습니다
 *       500:
 *         description: 서버 에러
 */
router.get('/products/:productId/reviews', reviewCtrl.getReviewsByProduct)

// ✅ 리뷰 등록(상품)
/**
 * @swagger
 * /products/{productId}/reviews:
 *   post:
 *     summary: 상품 리뷰 작성 (이미지 포함)
 *     tags: [Review]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: "리뷰를 작성할 상품의 ID"
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: number
 *                 description: "별점 (1 ~ 5)"
 *               title:
 *                 type: string
 *                 description: "리뷰 제목"
 *               content:
 *                 type: string
 *                 description: "리뷰 본문 내용"
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: "업로드할 리뷰 이미지 (최대 3개)"
 *     responses:
 *       201:
 *         description: 리뷰 작성 성공
 *       401:
 *         description: 로그인이 필요합니다
 *       403:
 *         description: 이 상품을 구매한 사용자만 리뷰를 작성할 수 있습니다
 *       404:
 *         description: 상품을 찾을 수 없습니다
 *       500:
 *         description: 서버 에러
 */
router.post('/products/:productId/reviews', isLoggedIn, reviewCtrl.createReviewForProduct)

// ✅ 리뷰 수정
/**
 * @swagger
 * /reviews/{reviewId}:
 *   patch:
 *     summary: 리뷰 수정
 *     tags: [Review]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: integer
 *         description: "수정할 리뷰의 ID"
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: number
 *                 description: "수정할 별점 (1 ~ 5)"
 *               title:
 *                 type: string
 *                 description: "수정할 리뷰 제목"
 *               content:
 *                 type: string
 *                 description: "수정할 리뷰 본문 내용"
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: "새로 등록할 리뷰 이미지"
 *     responses:
 *       200:
 *         description: 리뷰 수정 성공
 *       401:
 *         description: 로그인이 필요합니다
 *       403:
 *         description: 이 리뷰를 수정할 권한이 없습니다
 *       404:
 *         description: 해당 리뷰를 찾을 수 없습니다
 *       500:
 *         description: 서버 에러
 */
router.put('/reviews/:reviewId', isLoggedIn, reviewCtrl.updateReview)

// ✅ 리뷰 삭제
/**
 * @swagger
 * /reviews/{reviewId}:
 *   delete:
 *     summary: 리뷰 삭제
 *     tags: [Review]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: integer
 *         description: "삭제할 리뷰의 ID"
 *     responses:
 *       200:
 *         description: 리뷰 삭제 성공
 *       401:
 *         description: 로그인이 필요합니다
 *       403:
 *         description: 이 리뷰를 삭제할 권한이 없습니다
 *       404:
 *         description: 해당 리뷰를 찾을 수 없습니다
 *       500:
 *         description: 서버 에러
 */
router.delete('/reviews/:reviewId', isLoggedIn, reviewCtrl.deleteReview)

module.exports = router
