// ctrl/itemCtrl.js
const { Item, ItemImg, Seller } = require('../models')

exports.getRecentItems = async (req, res, next) => {
   try {
      const items = await Item.findAll({
         include: [
            {
               model: ItemImg,
               where: { rep_img_yn: true },
               required: false, // 대표 이미지 없어도 상품은 나오게
               attributes: ['id', 'img_url', 'rep_img_yn'],
            },
            {
               model: Seller,
               attributes: ['id', 'name'],
            },
         ],

         attributes: ['id', 'name', 'price', 'stock_number', 'status', 'createdAt', 'seller_id'],
         order: [['createdAt', 'DESC']],
         limit: 3,
      })

      res.json({
         success: true,
         message: '성공적으로 최근 상품을 불러왔습니다.',
         count: items.length,
         items,
      })
   } catch (error) {
      error.status = error.status || 500
      error.message = error.message || '최근 상품을 불러오는 중 오류 발생'
      next(error)
   }
}
