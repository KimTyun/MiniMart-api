const Sequelize = require('sequelize')
const env = process.env.NODE_ENV || 'development'
const config = require('../config/config.js')[env]

const db = {}

const sequelize = new Sequelize(config.database, config.username, config.password, config)

const Cart = require('./cart.js')
const Item = require('./item.js')
const User = require('./user.js')
const Seller = require('./seller.js')

db.sequelize = sequelize
db.Cart = Cart
db.Item = Item
db.User = User
db.Seller = Seller

Cart.init(sequelize)
Item.init(sequelize)
User.init(sequelize)
Seller.init(sequelize)

Cart.associate(db)
Item.associate(db)
User.associate(db)
Seller.associate(db)

module.exports = db
