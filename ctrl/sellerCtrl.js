const { Item, ItemImg } = require('../models')

// 특정 판매자의 모든 상품 조회
exports.getItemsBySeller = async (req, res, next) => {
   try {
      const { sellerId } = req.params // URL에서 sellerId를 추출

      const items = await Item.findAll({
         where: { seller_id: sellerId },
         include: [
            {
               model: ItemImg,
               where: { rep_img_yn: true }, // 대표 이미지만 포함
               required: false,
            },
         ],
      })

      res.status(200).json({
         success: true,
         message: '판매자 상품 목록 조회 성공',
         data: items,
      })
   } catch (error) {
      console.error(error)
      next(error)
   }
}
