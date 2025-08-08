const { isLoggedIn, isAdmin } = require('../../middlewares/middlewares')

const express = require('express')

const authCtrl = require('../../ctrl/authCtrl')
require('dotenv').config()
const router = express.Router()

// local.js에선 회원가입과 로그인 및 사이트에 회원으로 접속하기 위한 기능, 내 정보 관련 기능을 담당합니다.

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

// 내 정보 조회
/**
 * @swagger
 * /mypage:
 *   get:
 *     summary: 내 정보 + 주문 내역 + 팔로우한 판매자 목록 조회
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 내 정보 전체 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         email:
 *                           type: string
 *                         name:
 *                           type: string
 *                         address:
 *                           type: string
 *                         phone_number:
 *                           type: string
 *                         profile_img:
 *                           type: string
 *                         provider:
 *                           type: string
 *                         role:
 *                           type: string
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                     orders:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           order_id:
 *                             type: integer
 *                           product_name:
 *                             type: string
 *                           product_image:
 *                             type: string
 *                           order_date:
 *                             type: string
 *                             format: date
 *                           status:
 *                             type: string
 *                             example: "배송완료"
 *                     followings:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           seller_id:
 *                             type: integer
 *                           seller_name:
 *                             type: string
 *                           seller_profile_img:
 *                             type: string
 *       401:
 *         description: 인증이 필요합니다
 *       500:
 *         description: 서버 에러
 */
router.get('/mypage', isLoggedIn, authCtrl.getMe)

// 내 정보 수정
/**
 * @swagger
 * /mypage/edit:
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
router.patch('/mypage/edit', isLoggedIn, authCtrl.updateMe)

// 회원 탈퇴
/**
 * @swagger
 * /mypage/delete:
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
router.delete('/mypage/delete', isLoggedIn, authCtrl.deleteAccount)

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
router.post('/find-by-phone', authCtrl.findUserByPhone)

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
router.post('/send-reset-email', authCtrl.sendResetEmail)

module.exports = router
