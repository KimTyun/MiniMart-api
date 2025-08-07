//**findphone 작성한 것 동작하는지 확인되면**
// 파일 2: /ctrl/authCtrl.js 에 아래 함수들 추가
// (기존 authCtrl.js 파일의 맨 아래에 이어서 붙여넣으세요)

const { User, sequelize } = require('../models') // sequelize 추가
const mailer = require('../Nodemail/mailer') // 메일 발송을 위한 모듈
const crypto = require('crypto') // 임시 코드 생성을 위한 모듈

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
