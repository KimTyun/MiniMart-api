//*routes/auth/auth.js에 합쳐야 합니다. auth.js코드 완성되면 합치기

// 이 코드는 '/api/auth/find-by-phone' 같은 주소로 요청이 왔을 때,
// 어떤 컨트롤러 함수를 실행할지 연결해주는 역할을 합니다.

const express = require('express')
const router = express.Router()
const authCtrl = require('../ctrl/authCtrl')

// ... 기존의 다른 라우트들 (login, register 등) ...

// [추가] 전화번호로 사용자 정보(마스킹된 이메일) 찾기 API
router.post('/find-by-phone', authCtrl.findUserByPhone)

// [추가] 이메일 확인 후 비밀번호 재설정 메일 보내기 API
router.post('/send-reset-email', authCtrl.sendResetEmail)

module.exports = router
