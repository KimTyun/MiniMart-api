const { isLoggedIn } = require('../../middlewares/middlewares')

const express = require('express')
const authCtrl = require('../../ctrl/authCtrl')
require('dotenv').config()
const router = express.Router()
const { User, Order, Follow } = require('../../models')

// mypage.js는 내 정보 페이지의 구매내역 및 팔로우 한 판매자 표시, 내 정보 수정, 회원 탈퇴 등을 담당합니다.

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
router.get('/mypage', isLoggedIn, async (req, res) => {
   try {
      // 1. 유저 정보
      const user = await User.findByPk(req.user.id, {
         attributes: ['id', 'email', 'name', 'address', 'phone_number', 'profile_img', 'provider', 'role', 'createdAt'],
      })

      if (!user) {
         return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' })
      }

      // 2. 주문 내역 (Order + Product 조인)
      const orders = await Order.findAll({
         where: { user_id: req.user.id },
         include: [
            {
               model: Product,
               attributes: ['name', 'image_url'],
            },
         ],
         order: [['createdAt', 'DESC']],
      })

      const formattedOrders = orders.map((order) => ({
         order_id: order.id,
         product_name: order.Product.name,
         product_image: order.Product.image_url,
         order_date: order.createdAt.toISOString().split('T')[0],
         status: order.status,
      }))

      // 3. 팔로잉한 판매자 목록 (Follow + User 조인)
      const follows = await Follow.findAll({
         where: { follower_id: req.user.id },
         include: [
            {
               model: User,
               as: 'Following',
               attributes: ['id', 'name', 'profile_img'],
            },
         ],
      })

      const formattedFollowings = follows.map((f) => ({
         seller_id: f.Following.id,
         seller_name: f.Following.name,
         seller_profile_img: f.Following.profile_img,
      }))

      // 4. 응답
      res.status(200).json({
         success: true,
         data: {
            user: {
               ...user.toJSON(),
               createdAt: user.createdAt.toISOString().split('T')[0],
            },
            orders: formattedOrders,
            followings: formattedFollowings,
         },
      })
   } catch (error) {
      console.error(error)
      res.status(500).json({ message: '서버 에러' })
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
router.get('/mypage/edit', isLoggedIn, async (req, res) => {
   try {
      const user = await User.findByPk(req.user.id, {
         attributes: ['id', 'name', 'email', 'address', 'phone_number', 'profile_img', 'role', 'createdAt'],
      })

      if (!user) {
         return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' })
      }

      res.status(200).json({ user })
   } catch (error) {
      console.error(error)
      res.status(500).json({ message: '서버 에러' })
   }
})

// 내 정보 수정
// router.patch('/edit', isLoggedIn, async (req, res) => {
//    try {
//       const userId = req.user.id // middlewares에서 토큰 검증 후 붙은 값
//       const { name, address, phone_number, profile_img } = req.body

//       const user = await User.findByPk(userId)
//       if (!user) {
//          return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' })
//       }

//       // 전달된 값만 업데이트
//       if (name !== undefined) user.name = name
//       if (address !== undefined) user.address = address
//       if (phone_number !== undefined) user.phone_number = phone_number
//       if (profile_img !== undefined) user.profile_img = profile_img

//       await user.save()

//       res.status(200).json({
//          message: '회원 정보가 수정되었습니다.',
//          user: {
//             id: user.id,
//             name: user.name,
//             email: user.email,
//             address: user.address,
//             phone_number: user.phone_number,
//             profile_img: user.profile_img,
//          },
//       })
//    } catch (error) {
//       console.error(error)
//       res.status(500).json({ message: '서버 에러' })
//    }
// })

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
router.delete('/mypage/delete', isLoggedIn, async (req, res) => {
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
router.delete('/mypage/followings/:sellerId', isLoggedIn, async (req, res) => {
   try {
      const userId = req.user.id
      const sellerId = req.params.sellerId

      const deleted = await Follow.destroy({
         where: {
            follower_id: userId,
            following_id: sellerId,
         },
      })

      if (!deleted) {
         return res.status(404).json({ message: '팔로잉 관계를 찾을 수 없습니다.' })
      }

      res.status(200).json({ message: '팔로잉 취소 성공' })
   } catch (error) {
      console.error(error)
      res.status(500).json({ message: '서버 오류' })
   }
})

module.exports = router
