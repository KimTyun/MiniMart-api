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
