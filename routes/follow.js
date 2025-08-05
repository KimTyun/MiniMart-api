const express = require('express')
const router = express.Router()
const { isLoggedIn } = require('../middlewares')
const followCtrl = require('../ctrl/followCtrl')

// ✅ 특정 판매자 팔로우
/**
 * @swagger
 * /sellers/{sellerId}/follow:
 *   post:
 *     summary: 특정 판매자 팔로우하기
 *     tags: [Follow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sellerId
 *         required: true
 *         schema:
 *           type: integer
 *         description: "팔로우할 판매자의 ID"
 *     responses:
 *       200:
 *         description: 팔로우 성공
 *       401:
 *         description: 로그인이 필요합니다
 *       404:
 *         description: 해당 판매자를 찾을 수 없습니다
 *       409:
 *         description: 이미 팔로우한 판매자입니다
 *       500:
 *         description: 서버 에러
 */
router.post('/sellers/:sellerId/follow', isLoggedIn, followCtrl.followSeller)

// ✅ 특정 판매자 언팔로우
/**
 * @swagger
 * /sellers/{sellerId}/follow:
 *   delete:
 *     summary: 특정 판매자 언팔로우하기
 *     tags: [Follow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sellerId
 *         required: true
 *         schema:
 *           type: integer
 *         description: "언팔로우할 판매자의 ID"
 *     responses:
 *       200:
 *         description: 언팔로우 성공
 *       401:
 *         description: 로그인이 필요합니다
 *       404:
 *         description: 해당 판매자를 찾을 수 없습니다
 *       500:
 *         description: 서버 에러
 */
router.delete('/sellers/:sellerId/follow', isLoggedIn, followCtrl.unfollowSeller)

// ✅ 내가 팔로우하는 판매자 목록 조회
/**
 * @swagger
 * /users/me/following:
 *   get:
 *     summary: 내가 팔로우하는 판매자 목록 보기
 *     tags: [Follow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: 팔로우 목록 조회 성공
 *       401:
 *         description: 로그인이 필요합니다
 *       500:
 *         description: 서버 에러
 */
router.get('/users/me/following', isLoggedIn, followCtrl.getMyFollowedSellers)

module.exports = router
