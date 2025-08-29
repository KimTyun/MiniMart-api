const { Follow, Seller, User } = require('../models') // User 모델 추가

exports.followSeller = async (req, res, next) => {
   try {
      const userId = req.user.id
      const { sellerId } = req.params

      // 자기 자신을 팔로우하는 것을 방지
      if (parseInt(sellerId) === userId) {
         return res.status(400).json({ message: '자기 자신을 팔로우할 수 없습니다.' })
      }

      // paranoid 옵션을 false로 설정하여 삭제된 레코드도 포함해서 검색
      const existingFollow = await Follow.findOne({
         where: { buyer_id: userId, seller_id: sellerId },
         paranoid: false, // 삭제된 레코드도 포함
      })

      if (existingFollow) {
         if (existingFollow.deletedAt) {
            // 이미 언팔로우된 상태 -> 다시 팔로우 (restore)
            await existingFollow.restore()
            return res.status(201).json({ success: true, message: '판매자를 팔로우했습니다.' })
         } else {
            // 이미 팔로우 중인 상태
            return res.status(409).json({ message: '이미 팔로우한 판매자입니다.' })
         }
      }

      // 새로운 팔로우 관계 생성
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
               as: 'Seller',
               attributes: ['id', 'name', 'banner_img'], // banner_img 추가
               include: [
                  {
                     model: User,
                     attributes: ['profile_img'], // User 테이블에서 profile_img 가져오기
                  },
               ],
            },
         ],
         limit: 5,
         order: [['createdAt', 'DESC']],
      })

      // 데이터 구조를 프론트엔드가 예상하는 형태로 변환
      const sellers = followingList.map((f) => ({
         id: f.Seller.id,
         name: f.Seller.name,
         banner_img: f.Seller.banner_img,
         profile_img: f.Seller.User?.profile_img || null,
      }))

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
