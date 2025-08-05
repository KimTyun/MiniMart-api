const express = require('express')
const router = express.Router()
const { isLoggedIn } = require('../middlewares')
const reviewCtrl = require('../ctrl/reviewCtrl')

// seller_review.js에선 판매자의 리뷰 목록 조회, 등록, 수정과 삭제를 담당합니다.

/**
 * @swagger
 * tags:
 *   name: SellerReview
 *   description: 판매자 리뷰 관리 API
 */

// ✅ 판매자 리뷰 등록
/**
 * @swagger
 * /seller-reviews/{orderId}:
 *   post:
 *     summary: 판매자 리뷰 작성
 *     tags: [SellerReview]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: "리뷰를 작성할 대상 주문의 ID"
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: "판매자 리뷰 본문 내용"
 *               img:
 *                 type: string
 *                 format: binary
 *                 description: "업로드할 리뷰 이미지 (선택 사항)"
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 description: "판매자에 대한 별점 (1 ~ 5)"
 *     responses:
 *       201:
 *         description: 판매자 리뷰 작성 성공
 *       401:
 *         description: 로그인이 필요합니다
 *       403:
 *         description: 이 주문에 대해 리뷰를 작성할 권한이 없습니다
 *       404:
 *         description: 해당 주문을 찾을 수 없습니다
 *       409:
 *         description: 이미 이 주문에 대한 판매자 리뷰를 작성했습니다
 *       500:
 *         description: 서버 에러
 */
router.post('/:orderId' /* isLoggedIn, reviewCtrl.createSellerReview */)

// ✅ 특정 판매자에 대한 모든 리뷰 조회
/**
 * @swagger
 * /seller-reviews/{sellerId}:
 *   get:
 *     summary: 특정 판매자에 대한 모든 리뷰 조회
 *     tags: [SellerReview]
 *     parameters:
 *       - in: path
 *         name: sellerId
 *         required: true
 *         schema:
 *           type: integer
 *         description: "리뷰를 조회할 판매자의 ID"
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
 *         description: 해당 판매자를 찾을 수 없습니다
 *       500:
 *         description: 서버 에러
 */
router.get('/:sellerId' /* reviewCtrl.getReviewsBySeller */)

// ✅ 내가 작성한 판매자 리뷰 수정
/**
 * @swagger
 * /seller-reviews/{reviewId}:
 *   patch:
 *     summary: 판매자 리뷰 수정
 *     tags: [SellerReview]
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
 *               content:
 *                 type: string
 *               rating:
 *                 type: number
 *               img:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: 리뷰 수정 성공
 *       403:
 *         description: 이 리뷰를 수정할 권한이 없습니다
 * */
router.patch('/:reviewId' /* isLoggedIn, reviewCtrl.updateSellerReview */)

// ✅ 내가 작성한 판매자 리뷰 삭제
/**
 * @swagger
 * /seller-reviews/{reviewId}:
 *   delete:
 *     summary: 판매자 리뷰 삭제
 *     tags: [SellerReview]
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
 *       403:
 *         description: 이 리뷰를 삭제할 권한이 없습니다
 * */
router.delete('/:reviewId' /* isLoggedIn, reviewCtrl.deleteSellerReview */)

module.exports = router
