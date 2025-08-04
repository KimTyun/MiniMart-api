const express = require('express')
const router = express.Router()
const authCtrl = require('../ctrl/authCtrl')

// auth.js에선 회원가입과 로그인 및 사이트에 회원으로 접속하기 위한 기능을 다루고 있음

// 회원가입
/**
 * @swagger
 * /auth/join:
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
 *               - name
 *               - address
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: 회원가입 성공
 *       409:
 *         description: 이미 존재하는 이메일입니다
 *       500:
 *         description: 서버 에러
 */
router.post('/signup', authCtrl.signup)

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
 *                 token:
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
 *         description: 로그아웃 성공
 *       401:
 *         description: 로그인이 필요합니다
 *       500:
 *         description: 서버 에러
 */
router.post('/logout', authCtrl.logout) // 실제 구현은 선택 사항

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
router.get('/auto-login', isLoggedIn, authCtrl.autoLogin)

// 구글 간편 로그인
/**
 * @swagger
 * /auth/google:
 *   post:
 *     summary: 구글로 간편 로그인/가입
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idToken
 *             properties:
 *               idToken:
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
 *         description: 유효하지 않은 구글 인증 정보입니다
 *       500:
 *         description: 서버 에러
 */
router.get('/google', authCtrl.googleLogin) // 리디렉션용 엔드포인트

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

// 이메일 비번 찾기 - 인증코드 확인 후 비번 변경
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
router.post('/find/email/verify-and-reset', authCtrl.verifyEmailCodeAndReset)

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
router.post('/find/phone/verify-and-reset', authCtrl.verifyPhoneCodeAndReset)

module.exports = router
