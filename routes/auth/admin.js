const { isLoggedIn, isAdmin } = require('../middlewares')

const express = require('express')

const authCtrl = require('../../ctrl/authCtrl')
require('dotenv').config()
const router = express.Router()

// admin.js에선 관리자 기능을 담당합니다.

// ✅ 판매자격 신청 목록 조회
/**
 * @swagger
 * /admin/seller-applications:
 *   get:
 *     summary: 판매자격 신청 목록 조회 (관리자 전용)
 *     tags: [Admin]
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
 *         description: 신청 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   applicationId:
 *                     type: integer
 *                   userId:
 *                     type: integer
 *                   username:
 *                     type: string
 *                   storeName:
 *                     type: string
 *                   applicationDate:
 *                     type: string
 *                     format: date
 *       401:
 *         description: 관리자 로그인이 필요합니다
 *       403:
 *         description: 관리자 권한이 필요합니다
 *       500:
 *         description: 서버 에러
 */
router.get('/admin/seller-applications', isLoggedIn, isAdmin, authCtrl.getSeller)

// ✅ 판매자격 승인
/**
 * @swagger
 * /admin/seller-applications/{applicationId}/approve:
 *   patch:
 *     summary: 판매자 자격 승인 (관리자 전용)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: "승인할 신청의 ID"
 *     responses:
 *       200:
 *         description: 판매자 자격 승인 성공
 *       401:
 *         description: 관리자 로그인이 필요합니다
 *       403:
 *         description: 관리자 권한이 필요합니다
 *       404:
 *         description: 해당 신청을 찾을 수 없습니다
 *       409:
 *         description: 이미 처리된 신청입니다
 *       500:
 *         description: 서버 에러
 */
router.patch('/admin/seller-applications/:applicationId/approve', isLoggedIn, isAdmin, authCtrl.approveSeller)

// ✅ 전체 사용자 목록 조회
/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: 전체 사용자 목록 조회 (관리자 전용)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: "검색할 사용자 이름 또는 이메일"
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [BUYER, SELLER]
 *         description: "특정 역할의 사용자만 필터링 (선택 사항)"
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
 *         description: 사용자 목록 조회 성공
 *       401:
 *         description: 관리자 로그인이 필요합니다
 *       403:
 *         description: 관리자 권한이 필요합니다
 *       500:
 *         description: 서버 에러
 */
router.get('/admin/users', isLoggedIn, isAdmin, authCtrl.getAllUsers)

// ✅ 사용자 정보 강제 수정
/**
 * @swagger
 * /admin/users/{userId}:
 *   patch:
 *     summary: 사용자 정보 강제 수정 (관리자 전용)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: "수정할 사용자의 ID"
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [BUYER, SELLER]
 *                 description: "사용자 역할 강제 변경"
 *     responses:
 *       200:
 *         description: 사용자 정보 수정 성공
 *       401:
 *         description: 관리자 로그인이 필요합니다
 *       403:
 *         description: 관리자 권한이 필요합니다
 *       404:
 *         description: 해당 사용자를 찾을 수 없습니다
 *       500:
 *         description: 서버 에러
 */
router.patch('/admin/users/:userId', isLoggedIn, isAdmin, authCtrl.editUserInfo)

// ✅ 사용자 계정 강제 삭제
/**
 * @swagger
 * /admin/users/{userId}:
 *   delete:
 *     summary: 사용자 계정 강제 삭제 (관리자 전용)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: "삭제할 사용자의 ID"
 *     responses:
 *       200:
 *         description: 사용자 계정 삭제 성공
 *       401:
 *         description: 관리자 로그인이 필요합니다
 *       403:
 *         description: 관리자 권한이 필요합니다
 *       404:
 *         description: 해당 사용자를 찾을 수 없습니다
 *       500:
 *         description: 서버 에러
 */
router.delete('/admin/users/:userId', isLoggedIn, isAdmin, authCtrl.deleteUser)

// ✅ 전체 주문 내역 조회
/**
 * @swagger
 * /admin/orders:
 *   get:
 *     summary: 전체 주문 내역 검색/조회 (관리자 전용)
 *     tags: [Admin, Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: orderNumber
 *         schema:
 *           type: string
 *         description: "검색할 주문번호"
 *       - in: query
 *         name: buyerId
 *         schema:
 *           type: integer
 *         description: "특정 구매자의 주문만 필터링"
 *       - in: query
 *         name: sellerId
 *         schema:
 *           type: integer
 *         description: "특정 판매자의 주문만 필터링"
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
 *         description: 주문 내역 조회 성공
 *       401:
 *         description: 관리자 로그인이 필요합니다
 *       403:
 *         description: 관리자 권한이 필요합니다
 *       500:
 *         description: 서버 에러
 */
router.get('/admin/orders', isLoggedIn, isAdmin, authCtrl.getAllOrders)

// ✅ 주문 정보 수정
/**
 * @swagger
 * /admin/orders/{orderId}:
 *   patch:
 *     summary: 주문 정보 수정 (관리자 전용)
 *     tags: [Admin, Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: "수정할 주문의 ID"
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderStatus:
 *                 type: string
 *                 description: "변경할 주문 상태 (예: 배송중, 배송완료, 주문취소)"
 *               adminMemo:
 *                 type: string
 *                 description: "관리자 특이사항 메모"
 *     responses:
 *       200:
 *         description: 주문 정보 수정 성공
 *       401:
 *         description: 관리자 로그인이 필요합니다
 *       403:
 *         description: 관리자 권한이 필요합니다
 *       404:
 *         description: 해당 주문을 찾을 수 없습니다
 *       500:
 *         description: 서버 에러
 */
router.patch('/admin/orders/:orderId', isLoggedIn, isAdmin, authCtrl.editOrderInfo)

// ✅ 주문 내역 삭제
/**
 * @swagger
 * /admin/orders/{orderId}:
 *   delete:
 *     summary: 주문 내역 삭제 (관리자 전용)
 *     tags: [Admin, Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: "삭제할 주문의 ID"
 *     responses:
 *       200:
 *         description: 주문 내역 삭제 성공
 *       401:
 *         description: 관리자 로그인이 필요합니다
 *       403:
 *         description: 관리자 권한이 필요합니다
 *       404:
 *         description: 해당 주문을 찾을 수 없습니다
 *       500:
 *         description: 서버 에러
 */
router.delete('/admin/orders/:orderId', isLoggedIn, isAdmin, authCtrl.deleteOrder)

// ✅ Q&A 답변 등록
/**
 * @swagger
 * /admin/qna/{qnaId}:
 *   patch:
 *     summary: 문의에 답변 등록 (관리자 전용)
 *     tags: [Q&A, Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: qnaId
 *         required: true
 *         schema:
 *           type: integer
 *         description: "답변을 등록할 문의의 ID"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               answer:
 *                 type: string
 *                 description: "관리자의 답변 내용"
 *     responses:
 *       200:
 *         description: 답변 등록 성공
 *       401:
 *         description: 로그인이 필요합니다
 *       403:
 *         description: 관리자 권한이 필요합니다
 *       404:
 *         description: 해당 문의를 찾을 수 없습니다
 *       500:
 *         description: 서버 에러
 */
router.patch('/admin/qna/:qnaId', isLoggedIn, isAdmin, authCtrl.answerQna)

module.exports = router
