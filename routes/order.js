const express = require('express')
const router = express.Router()
const { isLoggedIn } = require('../middlewares')
const orderCtrl = require('../ctrl/orderCtrl')

//order.js에선 상품의 즉시 구매와 비회원 주문 조회를 담당합니다.

// ✅ 상품 단건 구매 (상세페이지에서 바로 주문)
/**
 * @swagger
 * /orders:
 *   post:
 *     summary: 주문 생성 (바로 구매)
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *               selectedOption:
 *                 type: string
 *     responses:
 *       201:
 *         description: 주문 생성 성공
 *       401:
 *         description: 로그인이 필요합니다
 */
router.post('/', isLoggedIn, orderCtrl.createOrder)

// ✅ 비회원 주문 조회
/**
 * @swagger
 * /orders/non-member/lookup:
 *   get:
 *     summary: 비회원 주문 조회
 *     tags: [Order]
 *     parameters:
 *       - in: query
 *         name: orderNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: "주문 시 발급받은 주문번호"
 *       - in: query
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: "주문 시 입력한 주문자 이름"
 *       - in: query
 *         name: password
 *         required: true
 *         schema:
 *           type: string
 *         description: "주문 시 설정한 간이 비밀번호"
 *     responses:
 *       200:
 *         description: 비회원 주문 조회 성공
 *       404:
 *         description: 주문 정보를 찾을 수 없습니다
 *       500:
 *         description: 서버 에러
 */
router.get('/non-member/lookup', orderCtrl.lookupNonMemberOrder)

module.exports = router
