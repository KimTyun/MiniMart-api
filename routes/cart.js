const express = require('express')
const router = express.Router()
const { isLoggedIn } = require('../middlewares')
const cartCtrl = require('../ctrl/cartCtrl')

// ✅ 장바구니 조회
/**
 * @swagger
 * /cart:
 *   get:
 *     summary: 내 장바구니 조회
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 내 장바구니 조회 성공
 *       401:
 *         description: 로그인이 필요합니다
 *       500:
 *         description: 서버 오류
 */
router.get('/', isLoggedIn, cartCtrl.getMyCart)

// ✅ 장바구니 수량 변경
/**
 * @swagger
 * /cart/items/{itemId}:
 *   patch:
 *     summary: 장바구니 상품 수량 변경
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *         description: "수량을 변경할 장바구니 아이템의 ID"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: 수량 변경 성공
 *       401:
 *         description: 로그인이 필요합니다
 *       404:
 *         description: 해당 상품을 장바구니에서 찾을 수 없습니다
 *       500:
 *         description: 서버 에러
 */
router.patch('/items/:itemId', isLoggedIn, cartCtrl.changeItemQuantity)

// ✅ 장바구니 상품 삭제
/**
 * @swagger
 * /cart/items/{itemId}:
 *   delete:
 *     summary: 장바구니 상품 삭제
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *         description: "삭제할 장바구니 아이템의 ID"
 *     responses:
 *       200:
 *         description: 상품 삭제 성공
 *       401:
 *         description: 로그인이 필요합니다
 *       404:
 *         description: 해당 상품을 장바구니에서 찾을 수 없습니다
 *       500:
 *         description: 서버 에러
 */
router.delete('/items/:itemId', isLoggedIn, cartCtrl.removeItem)

module.exports = router
