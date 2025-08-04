const { Sequelize, DataTypes } = require('sequelize')

module.exports = class Order extends Sequelize.Model {
   static init(sequelize) {
      return super.init(
         {
            status: {
               type: DataTypes.ENUM('PAID', 'SHIPPING', 'DELIVERED'),
               allowNull: 'false',
            },
         },
         {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'Order',
            tableName: 'orders',
            paranoid: true,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
         }
      )
   }

   static associate(db) {
      Order.belongsTo(db.User, {
         foreignKey: 'buyer_id',
         targetKey: 'id',
      })
      Order.hasMany(db.OrderItem, {
         foreignKey: 'order_id',
         sourceKey: 'id',
      })
      Order.belongsToMany(db.Item, {
         through: 'order_item',
         foreignKey: 'order_id',
         otherKey: 'item_id',
         onDelete: 'CASCADE',
      })
   }
}
