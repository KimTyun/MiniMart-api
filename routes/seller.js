const express = require('express')
const router = express.Router()
const sellerCtrl = require('../ctrl/sellerCtrl')

// seller.js에선 판매자의 내 정보와 판매자격 신청 기능 및 판매자의 검색, 등록 상품 조회, 팔로우 및 언팔로우 기능 등을 담당합니다.

// 판매자 자격 신청
/**
 * @swagger
 * /mypage/requestseller:
 *   post:
 *     summary: 판매자 자격 신청
 *     tags: [User, Seller]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               storeName:
 *                 type: string
 *                 description: "사용할 스토어(상점) 이름"
 *               contactNumber:
 *                 type: string
 *                 description: "연락 가능한 전화번호"
 *     responses:
 *       201:
 *         description: 판매자 자격 신청 성공 (처리 대기중)
 *       401:
 *         description: 로그인이 필요합니다
 *       409:
 *         description: 이미 판매자이거나 신청 처리중입니다
 *       500:
 *         description: 서버 에러
 */
router.post('/mypage/requestseller', isLoggedIn, sellerCtrl.applySeller)

// 내 정보 조회 (판매자 정보 포함)
/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: 내 정보 조회 (판매자 정보 포함)
 *     tags: [Seller Profile]
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
 *                 profileImageUrl:
 *                   type: string
 *                   description: "프로필 사진 이미지 주소"
 *                 introduction:
 *                   type: string
 *                   description: "자기소개"
 *                 role:
 *                   type: string
 *                   enum: [SELLER]
 *                 # --- 판매자 스토어 정보 ---
 *                 storeName:
 *                   type: string
 *                   description: "스토어(상점) 이름"
 *                 storeHashtags:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: "스토어 대표 해시태그 목록"
 *       401:
 *         description: 로그인이 필요합니다
 *       500:
 *         description: 서버 에러
 */
router.get('/users/me', isLoggedIn, sellerCtrl.getSellerProfile)

// 내 정보 수정 (판매자 정보 포함)
/**
 * @swagger
 * /users/me:
 *   patch:
 *     summary: 내 정보 수정 (판매자 정보 포함)
 *     tags: [Seller Profile]
 *     security:
 *       - bearerAuth: []
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
 *               profileImageUrl:
 *                 type: string
 *                 description: "새 프로필 사진 이미지 주소"
 *               introduction:
 *                 type: string
 *                 description: "새 자기소개"
 *               storeName:
 *                 type: string
 *                 description: "새 스토어 이름"
 *               storeHashtags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: "새 스토어 해시태그 목록"
 *     responses:
 *       200:
 *         description: 내 정보 수정 성공
 *       401:
 *         description: 로그인이 필요합니다
 *       500:
 *         description: 서버 에러
 */
router.patch('/users/me', isLoggedIn, sellerCtrl.updateSellerProfile)

// 내가 등록한 상품 목록 조회
/**
 * @swagger
 * /sellers/me/products:
 *   get:
 *     summary: 내가 등록한 상품 목록 조회
 *     tags: [Seller Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: "검색할 상품명"
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
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 상품 목록 조회 성공
 *       401:
 *         description: 로그인이 필요합니다
 *       403:
 *         description: 판매자 권한이 필요합니다
 *       500:
 *         description: 서버 에러
 */
router.get('/sellers/me/products', isLoggedIn, sellerCtrl.getMyProducts)

// 사용자 차단하기 (DM)
/**
 * @swagger
 * /users/{userId}/block:
 *   post:
 *     summary: 사용자 차단하기
 *     tags: [Communication]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: "차단할 사용자의 ID"
 *     responses:
 *       200:
 *         description: 사용자 차단 성공
 *       401:
 *         description: 로그인이 필요합니다
 *       404:
 *         description: 차단할 사용자를 찾을 수 없습니다
 *       409:
 *         description: 이미 차단한 사용자입니다
 *       500:
 *         description: 서버 에러
 */
router.post('/users/:userId/block', isLoggedIn, sellerCtrl.blockUser)

// ✅ 전체 판매자 목록 조회 (카테고리별 등)
/**
 * @swagger
 * /sellers:
 *   get:
 *     summary: 전체 판매자 목록 조회 (검색, 필터, 정렬)
 *     tags: [Seller]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: "검색할 스토어 이름"
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: "특정 카테고리의 상품을 판매하는 판매자만 필터링"
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, followers, newest]
 *         description: "정렬 기준 (이름순, 팔로워순, 최신순)"
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
 *         description: 판매자 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   sellerId:
 *                     type: integer
 *                   storeName:
 *                     type: string
 *                   profileImageUrl:
 *                     type: string
 *                   followerCount:
 *                     type: integer
 *                   shortIntroduce:
 *                     type: string
 *       500:
 *         description: 서버 에러
 */
router.get('/', sellerCtrl.getAllSellers)

/**
 * @swagger
 * tags:
 *   name: Seller
 *   description: 판매자 관련 API (프로필 조회, 팔로우 등)
 */

// ✅ 특정 판매자의 공개 프로필 조회
/**
 * @swagger
 * /sellers/{sellerId}:
 *   get:
 *     summary: 특정 판매자 프로필 조회
 *     tags: [Seller]
 *     parameters:
 *       - in: path
 *         name: sellerId
 *         required: true
 *         schema:
 *           type: integer
 *         description: "조회할 판매자의 ID"
 *     responses:
 *       200:
 *         description: 판매자 프로필 조회 성공
 *       404:
 *         description: 해당 판매자를 찾을 수 없습니다
 *       500:
 *         description: 서버 에러
 */
router.get('/:sellerId' /* sellerCtrl.getSellerProfile */)

// ✅ 특정 판매자의 상품 목록 조회
/**
 * @swagger
 * /sellers/{sellerId}/products:
 *   get:
 *     summary: 특정 판매자의 상품 목록 조회
 *     tags: [Seller]
 *     parameters:
 *       - in: path
 *         name: sellerId
 *         required: true
 *         schema:
 *           type: integer
 *         description: "상품 목록을 조회할 판매자의 ID"
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
 *         description: 상품 목록 조회 성공
 *       404:
 *         description: 해당 판매자를 찾을 수 없습니다
 *       500:
 *         description: 서버 에러
 */
router.get('/:sellerId/products' /* sellerCtrl.getProductsBySeller */)

// ✅ 특정 판매자 팔로우하기
/**
 * @swagger
 * /sellers/{sellerId}/follow:
 *   post:
 *     summary: 특정 판매자 팔로우하기
 *     tags: [Seller]
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
router.post('/:sellerId/follow' /* sellerCtrl.followSeller */)

// ✅ 특정 판매자 언팔로우하기
/**
 * @swagger
 * /sellers/{sellerId}/follow:
 *   delete:
 *     summary: 특정 판매자 언팔로우하기
 *     tags: [Seller]
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
router.delete('/:sellerId/follow' /* sellerCtrl.unfollowSeller */)

// ✅ 상품 상세 페이지 - 같은 판매자 다른 상품 진열
/**
 * @swagger
 * /sellers/{sellerId}/products:
 *   get:
 *     summary: 특정 판매자의 다른 상품 목록 조회
 *     tags: [Seller]
 *     parameters:
 *       - in: path
 *         name: sellerId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: "가져올 상품 개수 (예: 3)"
 *     responses:
 *       200:
 *         description: 상품 목록 조회 성공
 *       404:
 *         description: 해당 판매자를 찾을 수 없습니다
 */
router.get('/:sellerId/products', sellerCtrl.getProductsBySeller)

module.exports = router
