const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const nodemailer = require('nodemailer')
const { sendMail } = require('../routes/utils/mailer') // 유틸에서 메일 전송 함수 호출

const { User } = require('../models')

const SECRET = process.env.JWT_SECRET || 'minimart-secret-key'

//이메일 코드 임시 저장 메모리
const authCodes = {}

// routes에 있는 auth폴더의 각각 .js 파일들 기능들을 담당함. 스웨거 때문에 코드 너무 길어져서 분리.

// 회원가입
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
      const user = await Member.findOne({ where: { email } })
      if (!user) {
         return res.status(404).json({ message: '가입되지 않은 이메일입니다.' })
      }

      // 인증 코드 생성 (6자리 랜덤 숫자)
      const authCodes = Math.floor(100000 + Math.random() * 900000).toString()

      // 인증번호 5분 뒤 만료
      const expireAt = Date.now() + 5 * 60 * 1000

      // 또는 이메일 인증 테이블이 별도로 있다면 거기에 저장
      user.authCodes = authCodes
      await user.save()

      // 이메일 발송
      await sendMail({
         to: email,
         subject: 'MiniMart 비밀번호 재설정 인증 코드',
         text: `요청하신 인증 코드는 [${authCodes}] 입니다.`,
      })

      return res.status(200).json({ message: '인증 코드가 이메일로 전송되었습니다.' })
   } catch (err) {
      console.error(err)
      return res.status(500).json({ message: '서버 오류' })
   }
}

// 이메일로 비밀번호 초기화 - 이메일 인증코드 검증
exports.findPwByEmail = async (req, res) => {
   const { email, verificationCode, newPassword } = req.body

   try {
      //사용자 존재 여부 확인
      const user = await User.findOne({ where: { email } })
      if (!user) return res.status(404).json({ message: '가입되지 않은 이메일입니다' })

      //메모리 내 인증코드 존재 여부 확인
      const record = authCodes[email]
      if (!record) {
         return res.status(400).json({ message: '인증 코드가 존재하지 않습니다' })
      }

      //인증코드 만료 확인
      if (Date.now() > record.expireAt) {
         delete authCodes[email]
         return res.status(400).json({ message: '인증 코드가 만료되었습니다' })
      }
      //인증코드 일치 여부 확인
      if (record.code !== verificationCode) {
         return res.status(400).json({ message: '인증 코드가 올바르지 않습니다' })
      }
      //비밀번호 해싱 및 업데이트
      const hashedPw = await bcrypt.hash(newPassword, 10)
      await user.update({ password: hashedPw })

      //사용된 인증코드 삭제
      delete authCodes[email]

      return res.status(200).json({ message: '비밀번호 변경 성공' })
   } catch (err) {
      console.error('비밀번호 변경 중 오류:', err)
      return res.status(500).json({ message: '서버 에러' })
   }
}

// 이메일로 비밀번호 초기화 - 인증성공 시 새 비밀번호 등록
exports.resetPwByEmail = async (req, res) => {
   const { email, newPassword } = req.body
   // 회원가입 할 때랑 같은 방식 비번 아니면 차단
   const isValidPassword = (pw) => {
      return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(pw)
   }
   if (!isValidPassword(newPassword)) {
      return res.status(400).json({
         message: '비밀번호는 영문, 숫자, 특수문자를 포함해 8자 이상이어야 합니다.',
      })
   }

   if (!email || !newPassword) {
      return res.status(400).json({ message: '이메일과 새 비밀번호를 입력해주세요.' })
   }
   // 인증 여부 확인
   const verified = await authCodes.findOne({ where: { email, verified: true } })

   if (!verified) {
      return res.status(403).json({ message: '인증되지 않은 요청입니다.' })
   }
   // 사용자 존재여부 확인
   try {
      const user = await User.findOne({ where: { email } })

      if (!user) {
         return res.status(404).json({ message: '존재하지 않는 사용자입니다.' })
      }

      const hashed = await bcrypt.hash(newPassword, 10)
      user.password = hashed
      // 인증시간 만료
      if (verified.expire && new Date() > verified.expire) {
         await verified.destroy() // 만료된 인증은 제거
         return res.status(403).json({ message: '인증이 만료되었습니다. 다시 요청해주세요.' })
      }
      await user.save()

      // 인증했으면 버려
      await verified.destroy()

      res.json({ message: '비밀번호가 성공적으로 변경되었습니다.' })
   } catch (err) {
      console.error('비밀번호 변경 오류:', err)
      res.status(500).json({ message: '서버 오류로 비밀번호를 변경할 수 없습니다.' })
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
