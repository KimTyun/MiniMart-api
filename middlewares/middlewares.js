const jwt = require('jsonwebtoken')
const SECRET = process.env.JWT_SECRET || 'minimart-secret-key'

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
   console.log('💥 요청된 Authorization:', req.headers.authorization)

   if (!authHeader) {
      return res.status(401).json({ message: '인증 토큰이 필요합니다.' })
   }

   const token = authHeader.split(' ')[1]

   try {
      const decoded = jwt.verify(token, SECRET) // ⬅️ 여기도 동일한 SECRET 사용
      console.log('🧠 디코딩된 사용자:', decoded)
      req.user = decoded
      next()
   } catch (error) {
      console.error('❌ 토큰 디코딩 실패:', error)
      return res.status(401).json({ message: '유효하지 않은 토큰입니다.' })
   }
}
