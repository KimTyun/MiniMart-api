const express = require('express')
const router = express.Router()
const { isLoggedIn } = require('../middlewares')
const qnaCtrl = require('../ctrl/qnaCtrl')

// 1:1 문의 등록
/**
 * @swagger
 * /qna:
 *   post:
 *     summary: 새로운 1:1 문의 등록
 *     tags: [Q&A]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: "문의 제목"
 *               content:
 *                 type: string
 *                 description: "문의 내용"
 *               isPublic:
 *                 type: boolean
 *                 description: "공개 여부 (true: 공개, false: 비공개)"
 *     responses:
 *       201:
 *         description: 문의 등록 성공
 *       401:
 *         description: 로그인이 필요합니다
 *       500:
 *         description: 서버 에러
 */
router.post('/', isLoggedIn, qnaCtrl.createQna)

// 공개된 문의 목록 조회
/**
 * @swagger
 * /qna:
 *   get:
 *     summary: 공개된 문의 목록 조회
 *     tags: [Q&A]
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
 *         description: 공개된 문의 목록 조회 성공
 *       500:
 *         description: 서버 에러
 */
router.get('/', qnaCtrl.getPublicQnas)

// 내가 올린 문의 내역 조회
/**
 * @swagger
 * /users/me/qna:
 *   get:
 *     summary: 나의 문의 내역 조회
 *     tags: [Q&A]
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
 *         description: 나의 문의 내역 조회 성공
 *       401:
 *         description: 로그인이 필요합니다
 *       500:
 *         description: 서버 에러
 */
router.get('/users/me/qna', isLoggedIn, qnaCtrl.getMyQnas)

// 특정 문의 상세 조회
/**
 * @swagger
 * /qna/{qnaId}:
 *   get:
 *     summary: 특정 문의 상세 조회
 *     tags: [Q&A]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: qnaId
 *         required: true
 *         schema:
 *           type: integer
 *         description: "조회할 문의의 ID"
 *     responses:
 *       200:
 *         description: 문의 상세 조회 성공
 *       401:
 *         description: 로그인이 필요합니다
 *       403:
 *         description: 이 문의를 조회할 권한이 없습니다
 *       404:
 *         description: 해당 문의를 찾을 수 없습니다
 *       500:
 *         description: 서버 에러
 */
router.get('/:qnaId', isLoggedIn, qnaCtrl.getQnaDetail)

// 문의 삭제
/**
 * @swagger
 * /qna/{qnaId}:
 *   delete:
 *     summary: 문의 삭제
 *     tags: [Q&A]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: qnaId
 *         required: true
 *         schema:
 *           type: integer
 *         description: "삭제할 문의의 ID"
 *     responses:
 *       200:
 *         description: 문의 삭제 성공
 *       401:
 *         description: 로그인이 필요합니다
 *       403:
 *         description: 이 문의를 삭제할 권한이 없습니다
 *       404:
 *         description: 해당 문의를 찾을 수 없습니다
 *       500:
 *         description: 서버 에러
 */
router.delete('/:qnaId', isLoggedIn, qnaCtrl.deleteQna)

module.exports = router
