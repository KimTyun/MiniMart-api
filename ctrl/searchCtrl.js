const { Op } = require('sequelize')
const { Item, ItemImg, Seller } = require('../models')

exports.searchItems = async (req, res, next) => {
   try {
      const { keyword, category, minPrice, maxPrice, sortBy = 'newest' } = req.query
      const page = parseInt(req.query.page, 10) || 1
      const limit = parseInt(req.query.limit, 10) || 10
      const offset = (page - 1) * limit

      const whereClause = {}
      let orderClause = []

      if (keyword) {
         const keywords = keyword.split(' ').filter((k) => k.trim() !== '')
         if (keywords.length > 0) {
            whereClause[Op.and] = keywords.map((term) => ({
               [Op.or]: [{ name: { [Op.like]: `%${term}%` } }, { description: { [Op.like]: `%${term}%` } }],
            }))
         }
      }

      if (category) {
         whereClause.category = category
      }

      if (minPrice && maxPrice) {
         whereClause.price = { [Op.between]: [minPrice, maxPrice] }
      } else if (minPrice) {
         whereClause.price = { [Op.gte]: minPrice }
      } else if (maxPrice) {
         whereClause.price = { [Op.lte]: maxPrice }
      }

      switch (sortBy) {
         case 'price_asc':
            orderClause.push(['price', 'ASC'])
            break
         case 'price_desc':
            orderClause.push(['price', 'DESC'])
            break
         case 'popular':
            orderClause.push(['createdAt', 'DESC'])
            break
         case 'newest':
         default:
            orderClause.push(['createdAt', 'DESC'])
            break
      }

      const { count, rows } = await Item.findAndCountAll({
         where: whereClause,
         order: orderClause,
         limit: limit,
         offset: offset,
         distinct: true,
         include: [
            {
               model: ItemImg,
               where: { rep_img_yn: true },
               required: false,
            },
            {
               model: Seller,
               attributes: ['id', 'name'],
            },
         ],
      })

      res.status(200).json({
         success: true,
         message: '상품 검색에 성공했습니다.',
         data: {
            items: rows,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalItems: count,
         },
      })
   } catch (error) {
      console.error('상품 검색 컨트롤러 오류:', error)
      error.status = 500
      error.message = '상품을 검색하는 중 오류가 발생했습니다.'
      next(error)
   }
}
