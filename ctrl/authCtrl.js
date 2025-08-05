const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const { User } = require('../models')

const SECRET = process.env.JWT_SECRET || 'minimart-secret-key'

// routes에 있는 auth.js의 기능들을 담당함. 스웨거 때문에 코드 너무 길어져서 분리.

exports.signup = async (req, res) => {
   try {
      const { email, password, nickname, role = 'buyer' } = req.body

      // 이메일 중복 확인
      const existing = await User.findOne({ where: { email } })
      if (existing) {
         return res.status(400).json({ message: '이미 가입된 이메일입니다.' })
      }

      // 비밀번호 암호화
      const hash = await bcrypt.hash(password, 12)

      // 유저 생성
      const user = await User.create({
         email,
         password: hash,
         nickname,
         role,
      })
      res.send('회원가입 요청됨')
      res.status(201).json({ message: '회원가입 완료', user })
   } catch (err) {
      console.error(err)
      res.status(500).json({ message: '서버 에러' })
   }
}

exports.login = async (req, res) => {
   try {
      const { email, password } = req.body

      // 사용자 찾기
      const user = await User.findOne({ where: { email } })
      if (!user) {
         return res.status(400).json({ message: '이메일 또는 비밀번호가 틀렸습니다.' })
      }

      // 비밀번호 비교
      const match = await bcrypt.compare(password, user.password)
      if (!match) {
         return res.status(400).json({ message: '이메일 또는 비밀번호가 틀렸습니다.' })
      }

      // JWT 발급
      const token = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: '365d' })

      res.send('로그인 요청됨')
      res.json({ message: '로그인 성공', token })
   } catch (err) {
      console.error(err)
      res.status(500).json({ message: '서버 에러' })
   }
}

exports.getMe = async (req, res) => {
   try {
      const user = await User.findByPk(req.user.id, {
         attributes: ['id', 'email', 'nickname', 'address', 'phone_number', 'profile_img', 'provider', 'role', 'createdAt'],
      })

      if (!user) {
         return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' })
      }

      res.json({ user })
   } catch (error) {
      console.error(error)
      res.status(500).json({ message: '서버 에러' })
   }
}

exports.updateMe = async (req, res) => {
   try {
      const userId = req.user.id // middlewares에서 토큰 검증을 거쳐 붙은 값
      const { nickname, address, phone_number, profile_img } = req.body

      const user = await User.findByPk(userId)
      if (!user) {
         return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' })
      }

      user.nickname = nickname || user.nickname
      user.address = address || user.address
      user.phone_number = phone_number || user.phone_number
      user.profile_img = profile_img || user.profile_img

      await user.save()

      res.status(200).json({
         message: '회원 정보가 수정되었습니다.',
         user: {
            id: user.id,
            email: user.email,
            nickname: user.nickname,
            address: user.address,
            phone_number: user.phone_number,
            profile_img: user.profile_img,
         },
      })
   } catch (error) {
      console.error(error)
      res.status(500).json({ message: '서버 에러' })
   }
}
