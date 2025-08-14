const { Cart, Item, ItemOption, ItemImg } = require('../models')

// 현재 사용자의 장바구니 조회
exports.getCart = async (req, res, next) => {
   try {
      const userId = req.user.id // authorize 미들웨어를 통해 인증된 사용자의 ID
      const cartItems = await Cart.findAll({
         where: { buyer_id: userId },
         include: [
            {
               model: Item,
               attributes: ['id', 'name', 'price'],
               include: [{ model: ItemImg, where: { rep_img_yn: true }, required: false }],
            },
            {
               model: ItemOption,
               attributes: ['id', 'name', 'price'],
            },
         ],
         order: [['createdAt', 'DESC']],
      })
      res.status(200).json({
         success: true,
         message: '장바구니 조회에 성공했습니다.',
         data: cartItems,
      })
   } catch (error) {
      console.error(error)
      next(error)
   }
}

// 장바구니에 상품 추가
exports.addToCart = async (req, res, next) => {
   try {
      const userId = req.user.id
      const { itemId, itemOptionId, count } = req.body

      // 이미 장바구니에 동일한 상품(옵션)이 있는지 확인
      const existingItem = await Cart.findOne({
         where: { buyer_id: userId, item_id: itemId, item_option_id: itemOptionId },
      })

      if (existingItem) {
         // 이미 있다면 수량만 증가
         existingItem.count += count
         await existingItem.save()
         res.status(200).json({
            success: true,
            message: '장바구니에 상품 수량을 추가했습니다.',
            data: existingItem,
         })
      } else {
         // 없다면 새로 추가
         const newItem = await Cart.create({
            buyer_id: userId,
            item_id: itemId,
            item_option_id: itemOptionId,
            count,
         })
         res.status(201).json({
            success: true,
            message: '장바구니에 상품을 추가했습니다.',
            data: newItem,
         })
      }
   } catch (error) {
      console.error(error)
      next(error)
   }
}

// 장바구니 상품 삭제
exports.removeFromCart = async (req, res, next) => {
   try {
      const userId = req.user.id
      const { cartId } = req.params // cart 테이블의 pk

      const result = await Cart.destroy({
         where: { id: cartId, buyer_id: userId },
      })

      if (result === 0) {
         return res.status(404).json({ success: false, message: '해당 상품을 찾을 수 없습니다.' })
      }

      res.status(200).json({ success: true, message: '장바구니에서 상품을 삭제했습니다.' })
   } catch (error) {
      console.error(error)
      next(error)
   }
}
