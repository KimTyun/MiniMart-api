const { Follow, Seller } = require('../models')

// 로그인한 유저가 팔로우하는 판매자 목록 조회
exports.getFollowingSellers = async (req, res, next) => {
   try {
      const userId = req.user.id // isLoggedIn 미들웨어를 통해 얻은 유저 ID

      const followingList = await Follow.findAll({
         where: { buyer_id: userId },
         include: [
            {
               model: Seller,
               attributes: ['id', 'name', 'profile_img'], // 판매자의 ID, 이름, 프로필 이미지를 포함
            },
         ],
         limit: 5, // 메인 페이지에서는 5개만 보여주도록 제한
      })

      const sellers = followingList.map((f) => f.Seller)

      res.status(200).json({
         success: true,
         message: '팔로잉 목록 조회 성공',
         data: sellers,
      })
   } catch (error) {
      console.error(error)
      next(error)
   }
}
