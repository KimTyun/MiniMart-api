const { Item, ItemImg } = require('../models')

exports.getItemsBySeller = async (req, res, next) => {
   try {
      const { sellerId } = req.params

      const items = await Item.findAll({
         where: { seller_id: sellerId },
         include: [
            {
               model: ItemImg,
               where: { rep_img_yn: true },
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
