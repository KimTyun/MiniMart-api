// middlewares/middlewares.js
const jwt = require('jsonwebtoken')
const SECRET = process.env.JWT_SECRET || 'minimart-secret-key'
const { ROLE, ROLE_MAP } = require('../constants/role')

const normRole = (r) => String(r || '').toUpperCase()

// 1) JWT 우선, 없으면 passport 세션을 보조로 사용
exports.attachUser = (req, res, next) => {
   const h = req.headers.authorization
   if (h?.startsWith('Bearer ')) {
      const token = h.split(' ')[1]
      try {
         const decoded = jwt.verify(token, SECRET)
         req.user = decoded
         return next()
      } catch (e) {
         return res.status(401).json({ message: '유효하지 않은 토큰입니다.' })
      }
   }
   if (typeof req.isAuthenticated === 'function' && req.isAuthenticated()) {
      return next()
   }
   return next()
}

exports.requireAuth = (req, res, next) => {
   if (req.user) return next()
   return res.status(401).json({ message: '로그인이 필요합니다.' })
}

exports.requireRoles = (requiredRolesBitmask) => {
   return (req, res, next) => {
      if (!req.user) return res.status(401).json({ message: '로그인이 필요합니다.' })
      const roleStr = normRole(req.user.role)
      const userRoleBit = ROLE_MAP[roleStr]
      if (!userRoleBit) return res.status(403).json({ message: '권한 정보가 올바르지 않습니다.' })

      if ((userRoleBit & requiredRolesBitmask) === 0) {
         let message = '접근 권한이 없습니다.'
         if (requiredRolesBitmask === ROLE.SELLER) message = '판매자만 이용 가능한 기능입니다.'
         else if (requiredRolesBitmask === ROLE.ADMIN) message = '관리자만 이용 가능한 기능입니다.'
         else if (requiredRolesBitmask === (ROLE.SELLER | ROLE.ADMIN)) message = '관리자 혹은 판매자만 이용 가능합니다.'
         return res.status(403).json({ message })
      }
      next()
   }
}

// 과거 이름들 호환
exports.verifyToken = [exports.attachUser, exports.requireAuth]
exports.isLoggedIn = [exports.attachUser, exports.requireAuth]
exports.isSeller = [exports.attachUser, exports.requireAuth, exports.requireRoles(ROLE.SELLER)]
exports.isAdmin = [exports.attachUser, exports.requireAuth, exports.requireRoles(ROLE.ADMIN)]
exports.authorize = (bitmask) => [exports.attachUser, exports.requireAuth, exports.requireRoles(bitmask)]
