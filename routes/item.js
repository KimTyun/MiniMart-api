const express = require('express')
const router = express.Router()
const { isLoggedIn } = require('../middlewares')
const mainCtrl = require('../ctrl/mainCtrl')
const itemCtrl = require('../ctrl/itemCtrl')

// ✅ 상품 전체 조회 (필터/검색 조건은 쿼리로)
/**
 * @swagger
 * /products:
 *   get:
 *     summary: 상품 목록 조회
 *     tags: [Product]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 상품 목록 조회 성공
 *       500:
 *         description: 서버 오류
 */
router.get('/', itemCtrl.getAllItems)

// ✅ 단일 상품 상세 조회
/**
 * @swagger
 * /products:
 *   get:
 *     summary: 상품 목록 조회 (검색 기능 포함)
 *     tags: [Product]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: "검색할 상품명"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 상품 목록 조회 성공
 *       500:
 *         description: 서버 오류
 */
router.get('/:itemId', itemCtrl.getItemById)

// ✅ 인기 판매자 리스트 (슬라이더용)
/**
 * @swagger
 * /top-sellers:
 *   get:
 *     summary: 메인 화면 인기 판매자 목록 조회
 *     tags: [Main]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: 조회할 판매자 수 (예: 10)
 *     responses:
 *       200:
 *         description: 인기 판매자 목록 조회 성공
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
 *                   sellerProfileImageUrl:
 *                     type: string
 *                   followerCount:
 *                     type: integer
 *                   products:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         productId:
 *                           type: integer
 *                         productName:
 *                           type: string
 *                         productImageUrl:
 *                           type: string
 *                         price:
 *                           type: number
 *       500:
 *         description: 서버 에러
 */
router.get('/top-sellers', mainCtrl.getTopSellers)

// ✅ 최근 등록된 상품 리스트
/**
 * @swagger
 * /latest-products:
 *   get:
 *     summary: 메인 화면 최신 상품 목록 조회
 *     tags: [Main]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: 조회할 최신 상품 수 (예: 20)
 *     responses:
 *       200:
 *         description: 최신 상품 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   productId:
 *                     type: integer
 *                   productName:
 *                     type: string
 *                   productImageUrl:
 *                     type: string
 *                   price:
 *                     type: number
 *                   storeName:
 *                     type: string
 *       500:
 *         description: 서버 에러
 */
router.get('/latest-products', mainCtrl.getLatestProducts)

// ✅ 최근 인기 상품 리스트 (조회수/찜/판매량 기준 등)
/**
 * @swagger
 * /trending-products:
 *   get:
 *     summary: 메인 화면 인기 상품 목록 조회
 *     tags: [Main]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: 조회할 인기 상품 수 (예: 20)
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *         description: 인기 순위 집계 기간 (일간/주간/월간)
 *     responses:
 *       200:
 *         description: 인기 상품 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   productId:
 *                     type: integer
 *                   productName:
 *                     type: string
 *                   productImageUrl:
 *                     type: string
 *                   price:
 *                     type: number
 *                   storeName:
 *                     type: string
 *       500:
 *         description: 서버 에러
 */
router.get('/trending-products', mainCtrl.getTrendingProducts)

// ✅ 로그인 사용자의 팔로우 판매자 리스트
/**
 * @swagger
 * /my-follows:
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
router.get('/my-follows', isLoggedIn, mainCtrl.getMyFollowedSellers)

// ✅ 물품별 카테고리 선택 → 상품 목록 조회
/**
 * @swagger
 * /category/products/{categoryName}:
 *   get:
 *     summary: 특정 상품 카테고리 목록 조회
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: categoryName
 *         required: true
 *         schema:
 *           type: string
 *         description: 카테고리 이름
 *     responses:
 *       200:
 *         description: 카테고리 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   categoryId:
 *                     type: integer
 *                   categoryName:
 *                     type: string
 *       500:
 *         description: 서버 에러
 */
router.get('/category/products/:categoryName', mainCtrl.getProductsByCategory)

// ✅ 판매자별 카테고리 선택 → 판매자 목록 조회
/**
 * @swagger
 * /category/sellers/{categoryName}:
 *   get:
 *     summary: 특정 판매자 카테고리 목록 조회
 *     tags: [Seller]
 *     parameters:
 *       - in: path
 *         name: categoryName
 *         required: true
 *         schema:
 *           type: string
 *         description: 카테고리 이름
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
 *       500:
 *         description: 서버 에러
 */
router.get('/category/sellers/:categoryName', mainCtrl.getSellersByCategory)

// ✅ 상품 등록
/**
 * @swagger
 * /products:
 *   post:
 *     summary: 상품 등록
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 상품명
 *               price:
 *                 type: number
 *                 description: 가격
 *               stock:
 *                 type: integer
 *                 description: 재고 수량
 *               detail:
 *                 type: string
 *                 description: 상품 상세 설명
 *               img:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: 업로드할 상품 이미지 (최대 5개)
 *     responses:
 *       201:
 *         description: 상품 등록 성공
 *       400:
 *         description: 잘못된 요청 (필수 값 누락 등)
 *       401:
 *         description: 판매자 로그인이 필요합니다
 *       500:
 *         description: 서버 오류
 */
router.post('/', isLoggedIn, itemCtrl.createItem)

// ✅ 상품 수정
/**
 * @swagger
 * /products/{productId}:
 *   patch:
 *     summary: 상품 정보 수정
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 수정할 상품의 ID
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *               detail:
 *                 type: string
 *               img:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: 상품 정보 수정 성공
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 판매자 로그인이 필요합니다
 *       403:
 *         description: 상품을 수정할 권한이 없습니다
 *       404:
 *         description: 상품을 찾을 수 없습니다
 *       500:
 *         description: 서버 오류
 */
router.put('/:itemId', isLoggedIn, itemCtrl.updateItem)

// ✅ 상품 삭제
/**
 * @swagger
 * /products/{productId}:
 *   delete:
 *     summary: 상품 삭제
 *     tags: [Product]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 삭제할 상품의 ID
 *     responses:
 *       200:
 *         description: 상품 삭제 성공
 *       401:
 *         description: 판매자 로그인이 필요합니다
 *       403:
 *         description: 상품을 삭제할 권한이 없습니다
 *       404:
 *         description: 상품을 찾을 수 없습니다
 *       500:
 *         description: 서버 오류
 */
router.delete('/:itemId', isLoggedIn, itemCtrl.deleteItem)

// ✅  상품 상세 페이지 - 상품 상세 조회
/**
 * @swagger
 * /products/{productId}:
 *   get:
 *     summary: 상품 상세 조회
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 상품 상세 조회 성공
 *       404:
 *         description: 상품을 찾을 수 없습니다
 *       500:
 *         description: 서버 오류
 */
router.get('/:productId', itemCtrl.getItemDetail)

module.exports = router
