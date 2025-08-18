const { Follow, Seller } = require('../models')

// 1. 판매자 팔로우하기
exports.followSeller = async (req, res, next) => {
   try {
      const userId = req.user.id // 로그인한 유저의 ID
      const { sellerId } = req.params // 팔로우할 판매자의 ID

      // 이미 팔로우했는지 확인
      const existingFollow = await Follow.findOne({
         where: { buyer_id: userId, seller_id: sellerId },
      })

      if (existingFollow) {
         return res.status(409).json({ message: '이미 팔로우한 판매자입니다.' })
      }

      // 팔로우 관계 생성
      await Follow.create({
         buyer_id: userId,
         seller_id: sellerId,
      })

      res.status(201).json({ success: true, message: '판매자를 팔로우했습니다.' })
   } catch (error) {
      console.error(error)
      next(error)
   }
}

// 2. 판매자 언팔로우하기
exports.unfollowSeller = async (req, res, next) => {
   try {
      const userId = req.user.id
      const { sellerId } = req.params

      const result = await Follow.destroy({
         where: { buyer_id: userId, seller_id: sellerId },
      })

      if (result === 0) {
         return res.status(404).json({ message: '팔로우 관계를 찾을 수 없습니다.' })
      }

      res.status(200).json({ success: true, message: '판매자를 언팔로우했습니다.' })
   } catch (error) {
      console.error(error)
      next(error)
   }
}

// 3. 내가 팔로우하는 판매자 목록 조회 (홈페이지용)
exports.getFollowingSellersForHome = async (req, res, next) => {
   try {
      const userId = req.user.id

      const followingList = await Follow.findAll({
         where: { buyer_id: userId },
         include: [
            {
               model: Seller,
               attributes: ['id', 'name', 'profile_img'], // 판매자 정보 포함
            },
         ],
         limit: 5, // 메인 페이지에서는 5개만 보여주도록 제한
         order: [['createdAt', 'DESC']], // 최근에 팔로우한 순서
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
