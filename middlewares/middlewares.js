const jwt = require('jsonwebtoken')
const SECRET = process.env.JWT_SECRET || 'minimart-secret-key'
const { ROLE, ROLE_MAP } = require('../constants/role')

exports.authorize = function (requiredRolesBitmask) {
   return (req, res, next) => {
      // 로그인이 되지 않았을경우 에러 미들웨어로 에러 전송
      if (!req.isAuthenticated()) {
         const error = new Error('로그인이 필요합니다.')
         error.status = 403
         return next(error)
      }

      const roleStr = req.user?.role
      const userRoleBit = ROLE_MAP[roleStr]

      if ((userRoleBit & requiredRolesBitmask) === 0) {
         const error = new Error()
         error.status = 403
         if (requiredRolesBitmask === 2) {
            error.message = '판매자만 이용 가능한 기능입니다.'
         } else if (requiredRolesBitmask == 4) {
            error.message = '관리자만 이용 가능한 기능입니다.'
         } else if (requiredRolesBitmask > 4) {
            error.message = '관리자 혹은 판매자만 이용 가능한 기능입니다.'
         } else {
            error.message = '접근 권한이 없습니다.'
         }
         return next(error)
      }

      next()
   }
}
exports.verifyToken = (req, res, next) => {
   const authHeader = req.headers.authorization

   if (!authHeader) {
      return res.status(401).json({ message: '토큰이 필요합니다.' })
   }

   const token = authHeader.split(' ')[1]

   try {
      const decoded = jwt.verify(token, SECRET)
      req.user = decoded
      next()
   } catch (error) {
      return res.status(401).json({ message: '유효하지 않은 토큰입니다.' })
   }
}

exports.isLoggedIn = (req, res, next) => {
   const authHeader = req.headers.authorization
   if (!authHeader) {
      return res.status(401).json({ message: '인증 토큰이 필요합니다.' })
   }
   const token = authHeader.split(' ')[1] // "Bearer <TOKEN>" 형식

   try {
      // 토큰을 검증하고, 성공 시 디코딩된 정보를 req.user에 저장
      req.user = jwt.verify(token, process.env.JWT_SECRET)
      return next()
   } catch (error) {
      // 토큰이 유효하지 않은 경우
      return res.status(401).json({ message: '유효하지 않은 토큰입니다.' })
   }
}

//판매자 권한 확인
exports.isSeller = (req, res, next) => {
   // 로그인 상태 확인
   if (req.isAuthenticated()) {
      // 사용자 권한 확인
      if (req.user && req.user.role === 'SELLER') {
         next() // role이 ADMIN이면 다음 미들웨어로 이동
      } else {
         //권한 부족
         const error = new Error('판매자 계정만 이용 가능한 기능입니다.')
         error.status = 403
         return next(error)
      }
   } else {
      const error = new Error('로그인이 필요합니다.')
      error.status = 403
      return next(error)
   }
}

// 관리자 권한 확인 미들웨어
exports.isAdmin = (req, res, next) => {
   // 로그인 상태 확인
   if (req.isAuthenticated()) {
      // 사용자 권한 확인
      if (req.user && req.user.role === 'ADMIN') {
         next() // role이 ADMIN이면 다음 미들웨어로 이동
      } else {
         //권한 부족
         const error = new Error('관리자 권한이 필요합니다.')
         error.status = 403
         return next(error)
      }
   } else {
      const error = new Error('로그인이 필요합니다.')
      error.status = 403
      return next(error)
   }
}
