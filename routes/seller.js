const express = require('express')
const router = express.Router()
const sellerCtrl = require('../ctrl/sellerCtrl')

// seller.js에선 판매자의 검색, 등록 상품 조회, 팔로우 및 언팔로우 기능을 담당합니다.

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

module.exports = router
