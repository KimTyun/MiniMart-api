const express = require('express')
const router = express.Router()
const { isLoggedIn } = require('./middlewares')
const chatCtrl = require('../ctrl/chatCtrl')

// ✅ DM 목록 조회
/**
 * @swagger
 * /chats:
 *   get:
 *     summary: 내 채팅방 목록 조회
 *     tags: [Chat]
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
 *         description: 채팅방 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   roomId:
 *                     type: integer
 *                   partnerName:
 *                     type: string
 *                   lastMessage:
 *                     type: string
 *                   unreadCount:
 *                     type: integer
 *       401:
 *         description: 로그인이 필요합니다
 *       500:
 *         description: 서버 에러
 */
router.get('/', isLoggedIn, chatCtrl.getChatRooms)

// ✅ 새 DM 시작
/**
 * @swagger
 * /chats:
 *   post:
 *     summary: 새로운 채팅 시작하기
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sellerId:
 *                 type: integer
 *                 description: "채팅을 시작할 상대방(판매자)의 ID"
 *               initialMessage:
 *                 type: string
 *                 description: "처음으로 보낼 메시지"
 *     responses:
 *       201:
 *         description: 채팅방 생성 및 메시지 전송 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 roomId:
 *                   type: integer
 *       401:
 *         description: 로그인이 필요합니다
 *       404:
 *         description: 해당 판매자를 찾을 수 없습니다
 *       500:
 *         description: 서버 에러
 */
router.post('/', isLoggedIn, chatCtrl.startChat)

// ✅ 과거 DM 내용 불러오기
/**
 * @swagger
 * /chats/{roomId}/messages:
 *   get:
 *     summary: 과거 대화 내용 불러오기
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: integer
 *         description: "메시지를 조회할 채팅방의 ID"
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
 *         description: 과거 메시지 조회 성공
 *       401:
 *         description: 로그인이 필요합니다
 *       403:
 *         description: 해당 채팅방에 접근할 권한이 없습니다
 *       404:
 *         description: 해당 채팅방을 찾을 수 없습니다
 *       500:
 *         description: 서버 에러
 */
router.get('/:roomId/messages', isLoggedIn, chatCtrl.getChatMessages)

module.exports = router
