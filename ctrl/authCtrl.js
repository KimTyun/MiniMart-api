const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const nodemailer = require('nodemailer')
const passport = require('passport')

const { sequelize, User, Seller } = require('../models')
const { sendMail } = require('../routes/utils/mailer') // 컨픽에서 메일 전송 함수 호출

const SECRET = process.env.JWT_SECRET || 'minimart-secret-key'

//이메일 코드 임시 저장 메모리
const authCodes = {}
const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString()

// routes에 있는 auth폴더의 각각 .js 파일들 기능들을 담당함. 스웨거 때문에 코드 너무 길어져서 분리.

// 판매자 신청
exports.registerSeller = async (req, res) => {
   const t = await sequelize.transaction()
   try {
      const userId = req.user?.id
      if (!userId) {
         await t.rollback()
         return res.status(401).json({ message: '로그인이 필요합니다.' })
      }

      const { name, introduce, phone_number, banner_img, biz_reg_no, representative_name, main_products, business_address } = req.body

      const user = await User.findByPk(userId, { transaction: t })
      if (!user) {
         await t.rollback()
         return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' })
      }
      if (user.role === 'SELLER') {
         await t.rollback()
         return res.status(409).json({ message: '이미 판매자입니다.' })
      }

      const dupBiz = await Seller.findOne({ where: { biz_reg_no }, transaction: t })
      if (dupBiz) {
         await t.rollback()
         return res.status(409).json({ message: '이미 등록된 사업자등록번호입니다.' })
      }

      const seller = await Seller.create(
         {
            id: userId,
            name,
            introduce: introduce ?? null,
            phone_number,
            banner_img: banner_img ?? null,
            biz_reg_no,
            representative_name,
            main_products: main_products ?? null,
            business_address,
            status: 'PENDING',
         },
         { transaction: t }
      )

      await t.commit()
      res.status(201).json({ message: '판매자 신청 완료 (승인 대기)', seller })
   } catch (err) {
      console.error(err)
      await t.rollback()
      res.status(500).json({ message: '판매자 등록 실패' })
   }
}

// 판매자 자격 신청
exports.getSeller = (req, res) => {
   res.send('판매자 자격 신청')
}

// 회원가입
exports.register = async (req, res) => {
   try {
      const { name, email, address, zipcode, extraaddress, detailaddress, password, phone_number, age, profile_img, role = 'buyer' } = req.body
      const defaultProfileImg = '/uploads/profile-images/default.png'

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
         zipcode,
         detailaddress,
         extraaddress,
         age,
         role,
         phone_number,
         provider: 'local',
         profile_img: defaultProfileImg,
      })
      return res.status(201).json({ message: '회원가입 완료', user })
   } catch (err) {
      console.error(err)
      res.status(500).json({ message: '서버 에러' })
   }
}

// 로그인
exports.login = (req, res, next) => {
   passport.authenticate('local', (authError, user, info) => {
      if (authError) {
         console.error(authError)
         const error = new Error('인증 처리 중 서버 오류가 발생했습니다.')
         error.status = 500
         return next(error) // 에러 처리 미들웨어로 전달
      }

      if (!user) {
         const error = new Error(info.message || '이메일 또는 비밀번호가 올바르지 않습니다.')
         error.status = 401 // Unauthorized
         return next(error)
      }

      req.login(user, (loginError) => {
         // req.login 과정에서 오류가 발생한 경우
         if (loginError) {
            console.error(loginError)
            const error = new Error('로그인 처리 중 서버 오류가 발생했습니다.')
            error.status = 500
            return next(error)
         }

         // JWT 토큰 생성
         const token = jwt.sign(
            {
               id: user.id,
               email: user.email,
               role: user.role,
            },
            SECRET,
            { expiresIn: '1h' }
         )
         return res.status(200).json({
            success: true,
            message: '로그인 성공',
            user: {
               id: user.id,
               email: user.email,
               name: user.name,
               role: user.role,
            },
            token,
         })
      })
   })(req, res, next)
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

// [추가] 전화번호로 사용자 찾기 컨트롤러
exports.findUserByPhone = async (req, res) => {
   try {
      const { phone } = req.body
      if (!phone) {
         return res.status(400).json({ message: '전화번호를 입력해주세요.' })
      }

      const user = await User.findOne({ where: { phone_number: phone } })

      if (!user) {
         return res.status(404).json({ message: '해당 전화번호로 가입된 회원이 없습니다.' })
      }

      // 이메일 마스킹 (e.g., test@google.com -> t***@google.com)
      const [localPart, domain] = user.email.split('@')
      const maskedEmail = `${localPart[0]}${'*'.repeat(localPart.length - 1)}@${domain}`

      res.status(200).json({ maskedEmail: maskedEmail })
   } catch (error) {
      console.error(error)
      res.status(500).json({ message: '서버 오류가 발생했습니다.' })
   }
}

// [추가] 이메일 확인 후 비밀번호 재설정 메일 보내기 컨트롤러
exports.sendResetEmail = async (req, res) => {
   const t = await sequelize.transaction() // 트랜잭션 시작
   try {
      const { phone, email } = req.body

      const user = await User.findOne({ where: { phone_number: phone } })

      if (!user || user.email !== email) {
         return res.status(400).json({ message: '사용자 정보가 일치하지 않습니다.' })
      }

      // 6자리 숫자 인증 코드 생성
      const code = crypto.randomInt(100000, 999999).toString()
      const expires_at = new Date(Date.now() + 10 * 60 * 1000) // 10분 후 만료

      // DB에 인증 코드 저장 (SQL 직접 실행)
      await sequelize.query('INSERT INTO password_resets (email, code, expires_at) VALUES (?, ?, ?)', {
         replacements: [email, code, expires_at],
         type: sequelize.QueryTypes.INSERT,
         transaction: t,
      })

      // 이메일 발송
      await mailer.sendPasswordResetCode(email, code)

      await t.commit() // 모든 작업이 성공하면 커밋

      res.status(200).json({ message: `[${email}] 주소로 인증 코드를 보냈습니다.` })
   } catch (error) {
      await t.rollback() // 오류 발생 시 롤백
      console.error(error)
      res.status(500).json({ message: '이메일 발송 중 오류가 발생했습니다.' })
   }
}
