const { isLoggedIn, isAdmin } = require('../middlewares')

const express = require('express')

const authCtrl = require('../../ctrl/authCtrl')
require('dotenv').config()
const router = express.Router()

// local.js에선 회원가입과 로그인 및 사이트에 회원으로 접속하기 위한 기능, 내 정보 관련 가능, 관리자 기능(임시)을 담당합니다.

// 회원가입
/**
 * @swagger
 * /register:
 *   post:
 *     summary: 사용자 회원가입
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - address
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               address:
 *                 type: string
 *               phone_number:
 *                 type: string
 *                 description: 선택사항 (비밀번호 찾기 기능에서 사용됨)
 *               provider:
 *                 type: string
 *                 enum: [LOCAL, GOOGLE, KAKAO]
 *                 default: LOCAL
 *               profile_img:
 *                 type: string
 *                 description: 프로필 이미지 URL (선택)
 *     responses:
 *       201:
 *         description: 회원가입 성공
 *       409:
 *         description: 이미 존재하는 이메일입니다
 *       500:
 *         description: 서버 에러
 */
router.post('/register', authCtrl.register)

// 로그인
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: 사용자 로그인
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: 로그인 성공 (토큰 발급)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       401:
 *         description: 이메일 또는 비밀번호가 올바르지 않습니다
 *       500:
 *         description: 서버 에러
 */
router.post('/login', authCtrl.login)

// 로그아웃 (프론트단에서 토큰 삭제 위주이므로 서버에선 의미 없음. 토큰 블랙리스트 처리할 경우만 필요)
/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: 사용자 로그아웃
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 로그아웃 성공 (클라이언트 측 토큰 삭제 권장)
 *       401:
 *         description: 로그인이 필요합니다
 *       500:
 *         description: 서버 에러
 */
router.post('/logout', authCtrl.logout)

// 자동 로그인 (JWT로 로그인 상태 확인)
/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: 토큰 재발급 (자동 로그인용)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: 새 액세스 토큰 발급 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *       401:
 *         description: 유효하지 않은 리프레시 토큰입니다
 *       500:
 *         description: 서버 에러
 */
router.get('/autoLogin', isLoggedIn, authCtrl.autoLogin)

// 카카오 간편 로그인
/**
 * @swagger
 * /auth/kakao:
 *   post:
 *     summary: 카카오로 간편 로그인/가입
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - authorizationCode
 *             properties:
 *               authorizationCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: 로그인 성공 (토큰 발급)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *       401:
 *         description: 유효하지 않은 카카오 인증 정보입니다
 *       500:
 *         description: 서버 에러
 */
router.get('/kakao', authCtrl.kakaoLogin) // 리디렉션용 엔드포인트

// 이메일 비번 찾기 - 인증코드 전송
/**
 * @swagger
 * /auth/password/reset-request:
 *   post:
 *     summary: 비밀번호 재설정 요청 (인증 코드 발송)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: 인증 코드 발송 요청 성공
 *       404:
 *         description: 가입되지 않은 이메일입니다
 *       500:
 *         description: 서버 에러
 */
router.post('/find/email/send-code', authCtrl.sendEmailCode)

// 이메일 비번 찾기 - 인증코드 확인
/**
 * @swagger
 * /auth/password/reset:
 *   post:
 *     summary: 비밀번호 재설정 확정
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - verificationCode
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *               verificationCode:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: 비밀번호 변경 성공
 *       400:
 *         description: 인증 코드가 올바르지 않습니다
 *       500:
 *         description: 서버 에러
 */
router.post('/find/email/verify-and-reset', authCtrl.resetPwByEmail)

// 전화번호 비번 찾기 - 인증코드 전송
/**
 * @swagger
 * /auth/password/sms-request:
 *   post:
 *     summary: 비밀번호 재설정 요청 (SMS 인증 코드 발송)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *             properties:
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: 인증 코드 발송 요청 성공
 *       404:
 *         description: 가입되지 않은 전화번호입니다
 *       500:
 *         description: 서버 에러
 */
router.post('/find/phone/send-code', authCtrl.sendPhoneCode)

// 전화번호 비번 찾기 - 인증코드 확인 후 비번 변경
/**
 * @swagger
 * /auth/password/sms-reset:
 *   post:
 *     summary: 비밀번호 재설정 확정 (SMS 인증)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *               - verificationCode
 *               - newPassword
 *             properties:
 *               phoneNumber:
 *                 type: string
 *               verificationCode:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: 비밀번호 변경 성공
 *       400:
 *         description: 인증 코드가 올바르지 않습니다
 *       500:
 *         description: 서버 에러
 */
router.post('/find/phone/verify-and-reset', authCtrl.verifyPhoneCode)

// 내 정보 조회
/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: 내 정보 조회
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 내 정보 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 email:
 *                   type: string
 *                 name:
 *                   type: string
 *                 address:
 *                   type: string
 *       401:
 *         description: 로그인이 필요합니다
 *       500:
 *         description: 서버 에러
 */
router.get('/users/me', isLoggedIn, authCtrl.getMe)

// 내 정보 수정
/**
 * @swagger
 * /users/me:
 *   patch:
 *     summary: 내 정보 수정
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: 내 정보 수정 성공
 *       401:
 *         description: 로그인이 필요합니다
 *       500:
 *         description: 서버 에러
 */
router.patch('/users/me', isLoggedIn, authCtrl.updateMe)

// 회원 탈퇴
/**
 * @swagger
 * /users/me:
 *   delete:
 *     summary: 회원 탈퇴
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 회원 탈퇴 성공
 *       401:
 *         description: 로그인이 필요합니다
 *       500:
 *         description: 서버 에러
 */
router.delete('/users/me', isLoggedIn, authCtrl.deleteAccount)

// 관리자 기능들

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
