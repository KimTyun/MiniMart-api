const { Follow, Seller } = require('../models')

exports.followSeller = async (req, res, next) => {
   try {
      const userId = req.user.id
      const { sellerId } = req.params

      const existingFollow = await Follow.findOne({
         where: { buyer_id: userId, seller_id: sellerId },
      })

      if (existingFollow) {
         return res.status(409).json({ message: '이미 팔로우한 판매자입니다.' })
      }

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

exports.getFollowingSellersForHome = async (req, res, next) => {
   try {
      const userId = req.user.id

      const followingList = await Follow.findAll({
         where: { buyer_id: userId },
         include: [
            {
               model: Seller,
               attributes: ['id', 'name', 'profile_img'],
            },
         ],
         limit: 5,
         order: [['createdAt', 'DESC']],
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
