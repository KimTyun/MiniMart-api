const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const nodemailer = require('nodemailer')

const { User } = require('../models')
const { sendMail } = require('../routes/utils/mailer') // 컨픽에서 메일 전송 함수 호출

const SECRET = process.env.JWT_SECRET || 'minimart-secret-key'

//이메일 코드 임시 저장 메모리
const authCodes = {}
const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString()

// routes에 있는 auth폴더의 각각 .js 파일들 기능들을 담당함. 스웨거 때문에 코드 너무 길어져서 분리.

// 회원가입
exports.register = async (req, res) => {
   try {
      const { name, email, address, password, phone_number, age, nickname, role = 'buyer' } = req.body

      // 이메일 중복 확인
      const existing = await User.findOne({ where: { email } })
      if (existing) {
         return res.status(400).json({ message: '이미 가입된 이메일입니다.' })
      }

      // 비밀번호 암호화
      const hash = await bcrypt.hash(password, 12)

      // 유저 생성
      const user = await User.create({
         name,
         email,
         address,
         password: hash,
         nickname,
         age,
         role,
         phone_number,
         provider: 'local',
      })
      return res.status(201).json({ message: '회원가입 완료', user })
   } catch (err) {
      console.error(err)
      res.status(500).json({ message: '서버 에러' })
   }
}

// 로그인
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

// 로그아웃
exports.logout = async (req, res) => {
   try {
      // 로그아웃은 프론트에서 토큰 삭제로 처리하므로, 백엔드는 그냥 메시지만 전달
      res.status(200).json({ message: '로그아웃 되었습니다.' })
   } catch (err) {
      console.error(err)
      res.status(500).json({ message: '서버 에러' })
   }
}

// 내 정보 조회
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

// 내 정보 수정
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

// 회원 탈퇴
exports.deleteAccount = async (req, res) => {
   res.status(200).json({ message: '회원 탈퇴 성공', user: req.user })
}

// 자동 로그인
exports.autoLogin = async (req, res) => {
   res.status(200).json({ message: '자동 로그인 성공', user: req.user })
}

// 이메일로 비밀번호 초기화 - 인증코드 전송
exports.sendEmailCode = async (req, res) => {
   const { email } = req.body

   try {
      // 1. 이메일로 가입된 사용자인지 확인
      const user = await User.findOne({ where: { email } })
      if (!user) {
         return res.status(404).json({ message: '가입되지 않은 이메일입니다' })
      }

      // 2. 인증 코드 생성 및 메모리 저장 (10분 유효)
      const code = generateCode()
      authCodes[email] = {
         code,
         expiresAt: Date.now() + 10 * 60 * 1000, // 10분 후 만료
      }

      // 3. 이메일 발송
      await sendMail({
         to: email,
         subject: '[minimart] 비밀번호 재설정 인증 코드입니다',
         text: `인증 코드: ${code}\n\n10분 이내로 입력해주세요.`,
      })
      console.log(`[인증코드] ${email} → ${code}`) //임시 메일함 역할

      return res.status(200).json({ message: '인증 코드가 전송되었습니다' })
   } catch (error) {
      console.error('이메일 인증 코드 전송 실패:', error)
      return res.status(500).json({ message: '서버 에러' })
   }
}

// 이메일로 비밀번호 초기화 - 이메일 인증코드 검증
exports.resetPwByEmail = async (req, res) => {
   const { email, verificationCode, newPassword } = req.body

   try {
      // 1. 코드 저장된 적 있는지 확인
      const authData = authCodes[email]
      if (!authData) {
         return res.status(400).json({ message: '인증 코드가 요청되지 않았습니다' })
      }

      // 2. 코드 만료 여부 확인
      if (Date.now() > authData.expiresAt) {
         delete authCodes[email]
         return res.status(400).json({ message: '인증 코드가 만료되었습니다' })
      }

      // 3. 코드 일치 여부 확인
      if (authData.code !== verificationCode) {
         return res.status(400).json({ message: '인증 코드가 올바르지 않습니다' })
      }

      // 4. 비밀번호 암호화
      const hashedPassword = await bcrypt.hash(newPassword, 10)

      // 5. DB에서 사용자 찾아서 비밀번호 변경
      const user = await User.findOne({ where: { email } })
      if (!user) {
         return res.status(404).json({ message: '가입되지 않은 이메일입니다' })
      }

      await user.update({ password: hashedPassword })

      // 6. 메모리에서 인증 코드 삭제
      delete authCodes[email]

      return res.status(200).json({ message: '비밀번호가 성공적으로 변경되었습니다' })
   } catch (error) {
      console.error('비밀번호 변경 실패:', error)
      return res.status(500).json({ message: '서버 에러' })
   }
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
