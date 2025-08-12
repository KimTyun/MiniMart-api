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
const ItemReview = require('./itemReview.js')
const SellerReview = require('./sellerReview.js')
const ItemOption = require('./itemOption.js')
const ItemImg = require('./itemImg.js')
const OrderItem = require('./orderitem.js')
const Order = require('./order.js')
const Chat = require('./chat.js')
const ChatMessage = require('./chatMessage.js')
const Hashtag = require('./hashtag.js')
const QnaBoard = require('./qnaBoard.js')
const QnaBoardImg = require('./qnaBoardImg.js')

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
db.ChatMessage = ChatMessage
db.Hashtag = Hashtag
db.QnaBoard = QnaBoard
db.QnaBoardImg = QnaBoardImg

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
ChatMessage.init(sequelize)
Hashtag.init(sequelize)
QnaBoard.init(sequelize)
QnaBoardImg.init(sequelize)

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
ChatMessage.associate(db)
Hashtag.associate(db)
QnaBoard.associate(db)
QnaBoardImg.associate(db)

module.exports = db
