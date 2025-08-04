const Sequelize = require('sequelize')
const env = process.env.NODE_ENV || 'development'
const config = require('../config/config.js')[env]

const db = {}

const sequelize = new Sequelize(config.database, config.username, config.password, config)

const Cart = require('./cart.js')
const Item = require('./item.js')
const User = require('./user.js')
const Seller = require('./seller.js')
const Follow = require('./follow.js')
const ItemReview = require('./item_review.js')
const SellerReview = require('./seller_review.js')
const ItemOption = require('./item_option.js')
const ItemImg = require('./item_img.js')
const OrderItem = require('./orderitem.js')
const Order = require('./order.js')
const Chat = require('./chat.js')

db.sequelize = sequelize
db.Cart = Cart
db.Item = Item
db.User = User
db.Seller = Seller
db.Follow = Follow
db.ItemReview = ItemReview
db.SellerReview = SellerReview
db.ItemOption = ItemOption
db.ItemImg = ItemImg
db.Order = Order
db.OrderItem = OrderItem
db.Chat = Chat

Cart.init(sequelize)
Item.init(sequelize)
User.init(sequelize)
Seller.init(sequelize)
Follow.init(sequelize)
ItemReview.init(sequelize)
SellerReview.init(sequelize)
ItemImg.init(sequelize)
ItemOption.init(sequelize)
Order.init(sequelize)
OrderItem.init(sequelize)
Chat.init(sequelize)

Cart.associate(db)
Item.associate(db)
User.associate(db)
Seller.associate(db)
Follow.associate(db)
ItemReview.associate(db)
SellerReview.associate(db)
ItemImg.associate(db)
ItemOption.associate(db)
Order.associate(db)
OrderItem.associate(db)
Chat.associate(db)

module.exports = db
