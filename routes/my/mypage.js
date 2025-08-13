const { isLoggedIn } = require('../../middlewares/middlewares')

const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const router = express.Router()
require('dotenv').config()
const { User, Order, Follow, Item, ItemImg, Seller, OrderItem } = require('../../models')

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
         const uploadDir = path.join(__dirname, '../../uploads/profile-images')
         if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true })
         }
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

      // 유저 정보 조회 (필요한 필드만 선택)
      const user = await User.findByPk(userId, {
         attributes: ['id', 'name', 'email', 'phone_number', 'address', 'profile_img', 'role'],
      })

      // 구매 내역 조회 (orderitem 조인)
      const orders = await Order.findAll({
         where: { buyer_id: userId },
         include: [
            {
               model: OrderItem,
               attributes: ['count'],
               include: [
                  {
                     model: Item,
                     attributes: ['id', 'name'],
                     include: [
                        {
                           model: ItemImg,
                           attributes: ['url'],
                           limit: 1,
                        },
                     ],
                  },
               ],
            },
         ],
         order: [['createdAt', 'DESC']],
      })

      // 팔로잉 목록 조회
      const followings = await Follow.findAll({
         where: { buyer_id: userId }, // buyer_id 사용
         include: [{ model: Seller, as: 'Seller', attributes: ['id', 'name'] }],
      })

      res.json({
         user,
         orders,
         followings: followings.map((f) => ({
            seller_id: f.Seller.id,
            seller_name: f.Seller.name,
            // seller_banner_img: f.Seller.banner_img,
         })),
      })
   } catch (error) {
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

      // user.update() 호출 시, 새로운 필드들을 업데이트
      await user.update({
         name,
         phone_number,
         zipcode,
         address,
         detailaddress,
         extraaddress,
      })

      // 업데이트된 user 객체를 반환
      res.json({ user })
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
router.delete('/delete', isLoggedIn, async (req, res) => {
   try {
      const userId = req.user.id

      // 1. 사용자 존재 여부 확인
      const user = await User.findByPk(userId)
      if (!user) {
         return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' })
      }

      // 2. 사용자 삭제
      await User.destroy({ where: { id: userId } })

      // 3. 세션 제거 및 쿠키 삭제 (콜백 내 응답으로 이동)
      if (req.session) {
         req.session.destroy((err) => {
            if (err) {
               console.error('세션 삭제 실패:', err)
               return res.status(500).json({
                  message: '회원 탈퇴는 되었지만, 세션 삭제에 실패했습니다.',
               })
            }

            // 세션 성공적으로 삭제됐을 때만 응답
            res.clearCookie('connect.sid')
            return res.status(200).json({ message: '회원 탈퇴 성공' })
         })
      } else {
         // 세션이 없는 경우에도 쿠키 제거 및 응답
         res.clearCookie('connect.sid')
         return res.status(200).json({ message: '회원 탈퇴 성공' })
      }
   } catch (error) {
      console.error('회원 탈퇴 오류:', error)
      return res.status(500).json({ message: '서버 오류로 인해 회원 탈퇴에 실패했습니다.' })
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

// 프사 업로드
router.post('/uploads/profile-images', isLoggedIn, upload.single('profileImage'), async (req, res, next) => {
   try {
      if (!req.file) return res.status(400).json({ message: '파일이 업로드되지 않았습니다.' })

      // 업로드된 이미지 경로
      const fileUrl = `/uploads/profile-images/${req.file.filename}`

      // 유저 DB에 프로필 이미지 경로 업데이트 (필요시)
      const user = await User.findByPk(req.user.id)
      if (user) {
         user.profile_img = fileUrl
         await user.save()
      }

      res.json({ url: fileUrl })
   } catch (error) {
      next(error)
   }
})

module.exports = router
