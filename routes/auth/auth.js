const express = require('express')

const { isLoggedIn, isAdmin } = require('../../middlewares/middlewares')
const authCtrl = require('../../ctrl/authCtrl')
const adminCtrl = require('../../ctrl/adminCtrl')

const User = require('../../models/user')

const router = express.Router()

const google = require('./google')
const kakao = require('./kakao')
const local = require('./local')

router.use('/google', google)
router.use('/kakao', kakao)
router.use('/local', local)
// auth.js에선 로그인 여부 확인 및 자동 로그인 기능 등을 담당합니다.

router.get('/', () => {
   console.log('/auth 주소임니다')
})

// 로그인 여부 확인 (http://localhost:8000/auth/status)
/**
 * @swagger
 * /auth/status:
 *   get:
 *     summary: 로그인 상태 확인
 *     description: 사용자의 로그인 상태를 확인하고, 로그인되어 있다면 사용자 정보를 반환합니다.
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: 로그인 여부와 사용자 정보 - 로그인 되어있을시 isAuthenticated:true, user:... , 로그인 안되어있을시 isAuthenticated:false, user:null
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     isAuthenticated:
 *                       type: boolean
 *                       example: true
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         name:
 *                           type: string
 *                           example: 홍길동
 *                         email:
 *                           type: string
 *                           example: test@example.com
 *                         role:
 *                           type: string
 *                           example: user
 *                         profile_img:
 *                           type: string
 *                           example: https://example.com/profile.jpg
 *                 - type: object
 *                   properties:
 *                     isAuthenticated:
 *                       type: boolean
 *                       example: false
 *       500:
 *         description: 서버 에러
 */
router.get('/status', async (req, res, next) => {
   try {
      if (req.isAuthenticated()) {
         const { id, name, email, role, profile_img, age } = req.user
         res.status(200).json({
            isAuthenticated: true,
            user: {
               id,
               name,
               role,
               email,
               profile_img,
               age,
            },
         })
      } else {
         // 로그인이 되지 않았을때
         res.status(200).json({
            isAuthenticated: false,
         })
      }
   } catch (error) {
      error.status = 500
      error.message = '로그인 상태확인 중 오류가 발생했습니다.'
      next(error)
   }
})

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
router.get('/autoLogin', isLoggedIn)

// 로그인된 사용자 정보 가져오기
router.get('/me', isLoggedIn, async (req, res) => {
   try {
      const user = await User.findByPk(req.user.id, {
         attributes: ['id', 'name', 'email', 'address', 'phone_number', 'profile_img', 'role', 'age', 'provider'],
      })
      if (!user) {
         return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' })
      }
      res.json(user)
   } catch (err) {
      console.error(err)
      res.status(500).json({ success: false, message: '사용자 정보 불러오기 실패' })
   }
})

router.post('/approve-seller', isAdmin, adminCtrl.approveSeller)
router.get('/users', isAdmin, adminCtrl.getAllUsers)

module.exports = router
