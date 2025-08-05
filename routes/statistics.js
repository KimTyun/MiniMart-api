const express = require('express')
const router = express.Router()
const { isLoggedIn } = require('../middlewares')
const statisticsCtrl = require('../ctrl/statisticsCtrl')

// statistics.js는 관리자, 판매자 페이지에서 쓰일 통계 기능을 담당합니다.

// ✅ 팔로워 요약 통계 조회(판매자)
/**
 * @swagger
 * /statistics/followers/summary:
 *   get:
 *     summary: 팔로워 요약 통계 조회 (파이 차트용)
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 팔로워 요약 통계 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 genderDistribution:
 *                   type: object
 *                   properties:
 *                     male:
 *                       type: integer
 *                     female:
 *                       type: integer
 *                     other:
 *                       type: integer
 *                 ageDistribution:
 *                   type: object
 *                   properties:
 *                     "10s":
 *                       type: integer
 *                     "20s":
 *                       type: integer
 *                     "30s":
 *                       type: integer
 *                     "40s_and_above":
 *                       type: integer
 *       401:
 *         description: 로그인이 필요합니다
 *       403:
 *         description: 판매자 권한이 필요합니다
 *       500:
 *         description: 서버 에러
 */
router.get('/followers/summary', isLoggedIn, statisticsCtrl.getFollowerSummary)

// ✅ 팔로워 수 추이 통계 조회(판매자)
/**
 * @swagger
 * /statistics/followers/trend:
 *   get:
 *     summary: 팔로워 수 추이 통계 조회 (꺾은선 그래프용)
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *         description: "집계 기간 단위 (일별/주별/월별)"
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: "조회 시작일 (YYYY-MM-DD)"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: "조회 종료일 (YYYY-MM-DD)"
 *     responses:
 *       200:
 *         description: 팔로워 수 추이 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   date:
 *                     type: string
 *                     format: date
 *                   count:
 *                     type: integer
 *       401:
 *         description: 로그인이 필요합니다
 *       403:
 *         description: 판매자 권한이 필요합니다
 *       500:
 *         description: 서버 에러
 */
router.get('/followers/trend', isLoggedIn, statisticsCtrl.getFollowerTrend)

// ✅ 판매 상품 통계 조회(판매자)
/**
 * @swagger
 * /statistics/sales/trend:
 *   get:
 *     summary: 판매 상품 통계 조회 (꺾은선 그래프용)
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *         description: "집계 기간 단위 (일별/주별/월별)"
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: "조회 시작일 (YYYY-MM-DD)"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: "조회 종료일 (YYYY-MM-DD)"
 *       - in: query
 *         name: productId
 *         schema:
 *           type: integer
 *         description: "특정 상품만 조회할 경우 상품 ID (선택 사항)"
 *     responses:
 *       200:
 *         description: 판매 통계 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   date:
 *                     type: string
 *                     format: date
 *                   salesCount:
 *                     type: integer
 *                     description: "판매 개수"
 *                   totalRevenue:
 *                     type: number
 *                     description: "총 판매액"
 *       401:
 *         description: 로그인이 필요합니다
 *       403:
 *         description: 판매자 권한이 필요합니다
 *       500:
 *         description: 서버 에러
 */
router.get('/sales/trend', isLoggedIn, statisticsCtrl.getSalesTrend)

// ✅ 전체 이용자 수 통계 (관리자 전용)
/**
 * @swagger
 * /admin/statistics/users/summary:
 *   get:
 *     summary: 전체 이용자 수 통계 (관리자 전용)
 *     tags: [Admin, Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 전체 이용자 수 통계 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalUsers:
 *                   type: integer
 *                   description: "총 이용자 수"
 *                 buyerCount:
 *                   type: integer
 *                   description: "구매자 수"
 *                 sellerCount:
 *                   type: integer
 *                   description: "판매자 수"
 *       401:
 *         description: 관리자 로그인이 필요합니다
 *       403:
 *         description: 관리자 권한이 필요합니다
 *       500:
 *         description: 서버 에러
 */
router.get('/admin/statistics/users/summary', isLoggedIn, isAdmin, statisticsCtrl.getUserSummaryStats)

// ✅ 가입자 수 추이 통계 (관리자 전용)
/**
 * @swagger
 * /admin/statistics/users/trend:
 *   get:
 *     summary: 가입자 수 추이 통계 (관리자 전용)
 *     tags: [Admin, Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *         description: "집계 기간 단위 (일별/주별/월별)"
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: "조회 시작일 (YYYY-MM-DD)"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: "조회 종료일 (YYYY-MM-DD)"
 *     responses:
 *       200:
 *         description: 가입자 수 추이 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   date:
 *                     type: string
 *                     format: date
 *                   signupCount:
 *                     type: integer
 *                     description: "해당 기간의 신규 가입자 수"
 *       401:
 *         description: 관리자 로그인이 필요합니다
 *       403:
 *         description: 관리자 권한이 필요합니다
 *       500:
 *         description: 서버 에러
 */
router.get('/admin/statistics/users/trend', isLoggedIn, isAdmin, statisticsCtrl.getUserSignupTrend)

module.exports = router
