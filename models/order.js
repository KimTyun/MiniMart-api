const { Sequelize, DataTypes } = require('sequelize')

module.exports = class Order extends Sequelize.Model {
   static init(sequelize) {
      return super.init(
         {
            buyer_id: {
               type: DataTypes.INTEGER,
               allowNull: true,
               reference: {
                  model: 'users',
                  key: 'id',
               },
            },
            status: {
               type: DataTypes.ENUM('PAID', 'SHIPPING', 'DELIVERED'),
               allowNull: false,
               defaultValue: 'PAID',
            },
            password: {
               type: DataTypes.STRING(255),
               allowNull: true,
            },
            is_user: {
               type: DataTypes.BOOLEAN,
               allowNull: false,
               defaultValue: false,
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
   }
}
