const { Op } = require('sequelize')
const { Item, ItemImg, Seller } = require('../models') // 검색에 필요한 모델들을 가져옵니다.

/**
 * 상품 검색을 처리하는 컨트롤러 함수
 * - 다양한 조건(키워드, 카테고리, 가격, 정렬)에 따라 상품을 검색합니다.
 * - 페이지네이션(Pagination)을 적용하여 결과를 반환합니다.
 */
exports.searchItems = async (req, res, next) => {
   try {
      // 1. 프론트엔드에서 보낸 검색 조건을 쿼리 파라미터(?key=value)에서 추출합니다.
      const { keyword, category, minPrice, maxPrice, sortBy = 'newest' } = req.query
      const page = parseInt(req.query.page, 10) || 1
      const limit = parseInt(req.query.limit, 10) || 10
      const offset = (page - 1) * limit

      // 2. Sequelize 쿼리를 만들기 위한 조건 객체를 생성합니다.
      const whereClause = {} // WHERE 조건절
      let orderClause = [] // ORDER BY 정렬 조건

      // 2-1. 키워드 검색 조건 추가 (상품명 또는 설명에 키워드가 포함된 경우)
      if (keyword) {
         whereClause[Op.or] = [{ name: { [Op.like]: `%${keyword}%` } }, { description: { [Op.like]: `%${keyword}%` } }]
      }

      // 2-2. 카테고리 필터링 조건 추가 (나중에 Item 모델에 'category' 컬럼이 추가되면 사용)
      if (category) {
         whereClause.category = category
      }

      // 2-3. 가격 범위 필터링 조건 추가
      if (minPrice && maxPrice) {
         whereClause.price = { [Op.between]: [minPrice, maxPrice] }
      } else if (minPrice) {
         whereClause.price = { [Op.gte]: minPrice } // gte: >= (크거나 같음)
      } else if (maxPrice) {
         whereClause.price = { [Op.lte]: maxPrice } // lte: <= (작거나 같음)
      }

      // 2-4. 정렬 조건 설정
      switch (sortBy) {
         case 'price_asc':
            orderClause.push(['price', 'ASC'])
            break
         case 'price_desc':
            orderClause.push(['price', 'DESC'])
            break
         case 'popular':
            // 'sales_count' 같은 판매량 필드가 있다고 가정 (현재는 임시로 최신순 처리)
            orderClause.push(['createdAt', 'DESC'])
            break
         case 'newest':
         default:
            orderClause.push(['createdAt', 'DESC'])
            break
      }

      // 3. 모든 조건을 조합하여 데이터베이스에서 상품을 조회합니다.
      const { count, rows } = await Item.findAndCountAll({
         where: whereClause,
         order: orderClause,
         limit: limit,
         offset: offset,
         distinct: true, // COUNT가 정확하도록 설정
         include: [
            {
               model: ItemImg,
               where: { rep_img_yn: true }, // 대표 이미지만 가져오기
               required: false, // 대표 이미지가 없는 상품도 나올 수 있도록
            },
            {
               model: Seller,
               attributes: ['id', 'name'], // 판매자 정보 포함
            },
         ],
      })

      // 4. 조회된 결과를 프론트엔드에 응답으로 보냅니다.
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
