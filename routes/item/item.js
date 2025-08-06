const express = require('express')
const router = express.Router()
const { authorize } = require('../../middlewares/middlewares')
const { ROLE } = require('../../constants/role')

//상품 등록, 삭제, 수정
//상품 조회 : 상품 단일조회(상세정보), 상품 다수조회(조건)

//상품 등록
router.post(
   '/',
   /*authorize(ROLE.SELLER),*/ (req, res, next) => {
      console.log('상품등록 api 요청 잘 왔음.')
      res.send('상품등록 api 요청 잘 왔음.')
   }
)

//상품 수정
router.put('/:itemId', authorize(ROLE.SELLER), (req, res, next) => {
   console.log('상품수정 api 요청 잘 왔음.')
   res.send('상품수정 api 요청 잘 왔음.')
})

//상품 삭제
router.delete('/:itemId', authorize(ROLE.SELLER | ROLE.ADMIN), (req, res, next) => {
   console.log('상품삭제 api 요청 잘 왔음.')
   res.send('상품삭제 api 요청 잘 왔음.')
})

// 단일상품 조회(상품 상제정보)
router.get('/:itemId', authorize(ROLE.ALL), (req, res, next) => {
   console.log('단일상품조회 api 요청 잘 왔음.')
   res.send('단일상품조회 api 요청 잘 왔음.')
})

module.exports = router
