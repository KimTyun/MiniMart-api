const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const transporter = require('../config/mailer')
const crypto = require('crypto')
const nodemailer = require('nodemailer')
const generateCode = require('../utils/codeGen')

const { User } = require('../models')

const SECRET = process.env.JWT_SECRET || 'minimart-secret-key'

//이메일 코드 전송 밑 입력받는 역할
const authCodes = {}

// routes에 있는 auth폴더의 각각 .js 파일들 기능들을 담당함. 스웨거 때문에 코드 너무 길어져서 분리.

exports.register = async (req, res) => {
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
         provider: 'local',
      })
      return res.status(201).json({ message: '회원가입 완료', user })
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

      return res.json({ message: '로그인 성공', token })
   } catch (err) {
      console.error(err)
      res.status(500).json({ message: '서버 에러' })
   }
}

exports.logout = async (req, res) => {
   try {
      // 로그아웃은 프론트에서 토큰 삭제로 처리하므로, 백엔드는 그냥 메시지만 전달
      res.status(200).json({ message: '로그아웃 되었습니다.' })
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

exports.deleteAccount = async (req, res) => {
   res.status(200).json({ message: '회원 탈퇴 성공', user: req.user })
}

exports.autoLogin = async (req, res) => {
   res.status(200).json({ message: '자동 로그인 성공', user: req.user })
}

// 이메일로 비밀번호 초기화 - 인증코드 전송
exports.resetPwByEmail = async (req, res) => {
   const { email } = req.body

   if (!email) {
      return res.status(400).json({ message: '이메일을 입력해주세요.' })
   }

   // 인증코드 생성
   const code = generateCode()

   // 인증코드 메모리에 저장 (이메일 → 코드)
   emailCodeMap.set(email, code)

   exports.resetPwByEmail = async (req, res) => {
      const { email } = req.body
      if (!email) {
         return res.status(400).json({ message: '이메일을 입력해주세요.' })
      }

      try {
         const code = generateCode()

         // 이메일 발송 설정
         const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
               user: process.env.EMAIL_USER,
               pass: process.env.EMAIL_PASS,
            },
         })

         // 메일 옵션 설정
         const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: '비밀번호 재설정 인증 코드',
            text: `인증 코드는 ${code} 입니다.`,
         }

         // 메일 전송
         await transporter.sendMail(mailOptions)

         // 인증코드 저장
         const EXPIRE_MINIUTES = 5
         const expiresAt = Date.now() + EXPIRE_MINIUTES * 60 * 1000

         authCodes[email] = { code, expiresAt }

         res.status(200).json({ message: '인증 코드가 발송되었습니다. 5분 안에 입력해주세요.' })
      } catch (error) {
         console.error('이메일 전송 에러:', error)
         res.status(500).json({ message: '오류로 인해 이메일 전송에 실패했습니다' })
      }
   }
}

// 이메일 인증코드 검증
exports.sendEmailCode = (req, res) => {
   const { email, code: inputCode } = req.body
   if (!inputCode) {
      return res.status(400).json({ message: '인증 코드를 입력해주세요.' })
   }

   const stored = authCodes[email]
   if (!stored) {
      return res.status(400).json({ message: '인증 코드를 요청한 기록이 없거나, 만료되었습니다.' })
   }

   const { code: storedCode, expiresAt } = stored

   if (Date.now() > expiresAt) {
      delete authCodes[email]
      return res.status(400).json({ message: '인증 코드가 만료되었습니다.' })
   }

   if (inputCode !== storedCode) {
      return res.status(400).json({ message: '인증 코드가 일치하지 않습니다.' })
   }

   //검증 완료 => 인증 했으면 삭제
   delete authCodes[email]

   res.status(200).json({ message: '인증되었습니다.' })
}

// 인증성공 시 새 비밀번호 등록
exports.findPwByEmail = (req, res) => {
   res.send('인증 성공 후 새 비밀번호 등록')
}

// 전화번호로 비밀번호 초기화 - 인증코드 전송
exports.sendPhoneCode = (req, res) => {
   res.send('전화번호로 인증 코드 전송')
}

// 전화번호 인증코드 검증
exports.verifyPhoneCode = (req, res) => {
   res.send('전화번호 인증 코드 검증')
}

// 인증성공 시 새 비밀번호 등록
exports.findPwByPhone = (req, res) => {
   res.send('전화번호 인증 성공 후 새 비밀번호 등록')
}

// 구글 소셜 로그인
exports.googleLogin = (req, res) => {
   res.send('구글 로그인')
}

// 카카오 소셜 로그인
exports.kakaoLogin = (req, res) => {
   res.send('카카오 로그인')
}

exports.getSeller = (req, res) => {
   res.send('판매자 자격 신청')
}

exports.approveSeller = (req, res) => {
   res.send('판매자 자격 승인')
}

exports.getAllUsers = (req, res) => {
   res.send('사용자 전체 목록')
}

exports.editUserInfo = (req, res) => {
   res.send('사용자 정보 수정')
}

exports.deleteUser = (req, res) => {
   res.send('사용자 삭제')
}

exports.getAllOrders = (req, res) => {
   res.send('주문 전체 목록')
}

exports.editOrderInfo = (req, res) => {
   res.send('주문 수정(관리자)')
}

exports.deleteOrder = (req, res) => {
   res.send('주문 삭제(관리자)')
}

exports.answerQna = (req, res) => {
   res.send('문의 답변')
}
