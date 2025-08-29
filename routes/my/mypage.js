const { isLoggedIn, authorize } = require('../../middlewares/middlewares')

const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const router = express.Router()
require('dotenv').config()
const { User, Order, Follow, Item, ItemImg, Seller, OrderItem, ItemReview } = require('../../models')
const { ROLE } = require('../../constants/role')

// mypage.js는 내 정보 페이지의 구매내역 및 팔로우 한 판매자 표시, 내 정보 수정, 회원 탈퇴 등을 담당합니다.

// uploads/profile-images 없으면 생성
const uploadDir = path.join(__dirname, '../../uploads/profile-images')
if (!fs.existsSync(uploadDir)) {
   fs.mkdirSync(uploadDir, { recursive: true })
}

// multer 설정
const upload = multer({
   storage: multer.diskStorage({
      destination(req, file, cb) {
         cb(null, uploadDir)
      },
      filename(req, file, cb) {
         const ext = path.extname(file.originalname)
         cb(null, Date.now() + ext)
      },
   }),
   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB 제한
})

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
 *                           item_name:
 *                             type: string
 *                           item_image:
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
router.get('/', isLoggedIn, async (req, res, next) => {
   try {
      const userId = req.user.id

      // 유저 정보 조회
      const user = await User.findByPk(userId, {
         attributes: ['id', 'name', 'email', 'phone_number', 'address', 'profile_img', 'role'],
      })

      // 주문 내역 조회
      const orders = await Order.findAll({
         where: { buyer_id: userId },
         order: [['createdAt', 'DESC']],
         include: [
            {
               model: OrderItem,
               include: [
                  {
                     model: Item,
                     include: [
                        { model: ItemImg },
                        {
                           model: Seller,
                           include: [{ model: User }],
                        },
                     ],
                  },
               ],
            },
         ],
      })

      // 팔로잉 목록 조회
      const followings = await Follow.findAll({
         where: { buyer_id: userId },
         include: [{ model: Seller, as: 'Seller', attributes: ['id', 'name'] }],
         raw: true,
         nest: true,
      })

      res.json({
         success: true,
         message: '내 정보 전체 조회 성공',
         data: {
            user,
            orders,
            followings: followings
               .filter((f) => f.Seller?.id)
               .map((f) => ({
                  id: f.Seller.id,
                  name: f.Seller.name,
               })),
         },
      })
   } catch (error) {
      console.error(error)
      next(error)
   }
})

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
router.patch('/edit', isLoggedIn, async (req, res, next) => {
   try {
      const userId = req.user.id
      const { name, phone_number, zipcode, address, detailaddress, extraaddress } = req.body

      const user = await User.findByPk(userId)
      if (!user) return res.status(404).json({ message: '유저를 찾을 수 없습니다.' })

      // user.update() 호출 시 새로운 필드들을 업데이트
      const updateData = {
         name,
         phone_number,
         zipcode,
         address,
         detailaddress,
         extraaddress,
      }
      await user.update(updateData)

      // 업데이트된 user 객체 반환
      res.json({
         success: true,
         message: '내 정보 수정 성공',
         data: {
            user,
         },
      })
   } catch (error) {
      next(error)
   }
})

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
router.delete('/delete', isLoggedIn, async (req, res, next) => {
   try {
      const userId = req.user.id

      const user = await User.findByPk(userId)
      if (!user) {
         return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' })
      }

      await User.destroy({ where: { id: userId } })

      if (req.session) {
         await new Promise((resolve, reject) => {
            req.session.destroy((err) => {
               if (err) {
                  console.error('세션 삭제 실패:', err)
                  reject(err)
               } else {
                  res.clearCookie('connect.sid')
                  resolve()
               }
            })
         })
      }
      return res.status(200).json({
         success: true,
         message: '회원 탈퇴 성공',
      })
   } catch (error) {
      console.error('회원 탈퇴 오류:', error)
      next(error)
   }
})

// 프사 업로드
router.post('/uploads/profile-images', isLoggedIn, upload.single('profileImage'), async (req, res, next) => {
   try {
      if (!req.file) return res.status(400).json({ message: '프로필 사진이 업데이트 되지 않았습니다.' })

      const user = await User.findByPk(req.user.id)
      if (!user) {
         fs.unlink(req.file.path, (err) => {
            if (err) console.error('프로필 사진 삭제에 실패했습니다: ', err)
         })
         return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' })
      }
      const oldProfImg = user.profile_img
      const newProfimg = `/uploads/profile-images/${req.file.filename}`

      user.profile_img = newProfimg
      await user.save()

      if (oldProfImg && oldProfImg.startsWith('/uploads/profile-images')) {
         const oldImgPath = path.join(__dirname, `../..${oldProfImg}`)
         fs.unlink(oldImgPath, (err) => {
            if (err) console.error('기존 프로필 삭제에 실패했습니다.: ', err)
         })
      }
      res.json({ url: newProfimg })
   } catch (error) {
      if (req.file) {
         fs.unlink(req.file.path, (error) => {
            if (error) console.error('에러 발생으로 업로드 파일을 삭제합니다.: ', error)
         })
      }
   }
})

// 리뷰 작성
router.post('/review', isLoggedIn, async (req, res, next) => {
   try {
      const userId = req.user.id
      const { orderId, content, rating } = req.body

      if (!orderId || !content || !rating) {
         return res.status(400).json({ message: '필수 데이터가 누락되었습니다.' })
      }
      const order = await Order.findOne({
         where: { id: orderId, buyer_id: userId },
         include: [
            {
               model: OrderItem,
               include: [
                  {
                     model: Item,
                     include: [
                        {
                           model: Seller,
                           include: [
                              {
                                 model: User,
                                 as: 'Seller',
                              },
                           ],
                        },
                     ],
                  },
               ],
            },
         ],
      })

      if (!order) {
         return res.status(404).json({ message: '해당 주문을 찾을 수 없거나, 권한이 없습니다.' })
      }

      const sellerId = order.OrderItems[0].Item.Seller.User.id
      if (!sellerId) {
         return res.status(404).json({ message: '판매자 정보를 찾을 수 없습니다.' })
      }
      const existReview = await ItemReview.findOne({
         where: { order_id: orderId },
      })

      if (existReview) {
         return res.status(400).json({ message: '해당 주문의 리뷰를 이미 작성했습니다.' })
      }

      const newReview = await ItemReview.create({
         buyer_id: userId,
         seller_id: sellerId,
         order_id: orderId,
         content: content,
         rating: rating,
      })
      await Order.update({ hasReview: true }, { where: { id: orderId } })

      return res.status(201).json({
         message: '리뷰가 성공적으로 등록되었습니다.',
         review: newReview,
         orderId: orderId,
      })
   } catch (error) {
      console.error('리뷰 등록 에러: ', error)
      next(error)
   }
})

// 주문 취소
/**
 *paths:
 *  /orders/{orderId}/cancel:
 *    patch:
 *      summary: 주문 취소
 *      tags:
 *        - Orders
 *      operationId: cancelOrder
 *      description: |
 *        사용자의 주문을 취소합니다.
 *        주문의 상태(status)가 'PAID'일 때만 취소가 가능하며,
 *        주문 상태를 'CANCELED'로 변경합니다.
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - name: orderId
 *          in: path
 *          description: 취소할 주문의 고유 ID
 *          required: true
 *          schema:
 *            type: string
 *            example: 'ORD_20250812_001'
 *      responses:
 *        '200':
 *          description: 주문이 성공적으로 취소됨
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: '주문이 취소되었습니다.'
 *        '400':
 *          description: 잘못된 요청 또는 취소할 수 없는 주문 상태
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: '이미 배송이 시작되어 주문을 취소할 수 없습니다.'
 *        '401':
 *          description: 인증 실패 (유효하지 않은 토큰)
 *        '404':
 *          description: 주문을 찾을 수 없음
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: '주문을 찾을 수 없습니다.'
 *        '500':
 *          description: 서버 오류
 */
router.patch('/:orderId/cancel', isLoggedIn, async (req, res, next) => {
   const { orderId } = req.params
   const userId = req.user.id
   try {
      const order = await Order.findOne({ where: { id: orderId, buyer_id: userId } })
      if (!order) {
         return res.status(404).json({ message: '해당 주문을 찾을 수 없습니다.' })
      }

      if (order.status !== 'PAID') {
         return res.status(400).json({ message: '이미 배송이 시작되어 주문을 취소할 수 없습니다.' })
      }

      await order.update({ status: 'CANCELED' })

      return res.status(200).json({ message: '주문이 성공적으로 취소되었습니다.' })
   } catch (error) {
      console.error('주문 취소 오류:', error)
      next(error)
   }
})

// 판매자를 언팔로우
router.post('/unfollow/:sellerId', isLoggedIn, async (req, res, next) => {
   try {
      const userId = req.user.id
      const sellerId = req.params.sellerId

      await Follow.destroy({ where: { buyer_id: userId, seller_id: sellerId } })

      res.json({ message: '언팔로우 되었습니다.' })
   } catch (error) {
      next(error)
   }
})

// 판매자 내정보 가져오기
router.get('/seller', authorize(ROLE.SELLER), async (req, res, next) => {
   try {
      const seller = await Seller.findByPk(req.user.id)

      if (!seller) {
         const error = new Error('판매자 정보를 찾을 수 없습니다.')
         error.status = 404
         throw error
      }
      res.json({
         success: true,
         message: '판매자 정보 불러옴',
         seller,
      })
   } catch (error) {
      console.error(error)
      error.message = error.message || '판매자 정보 불러오는 중 에러발생'
      next(error)
   }
})

module.exports = router
