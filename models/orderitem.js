const { Sequelize, DataTypes } = require('sequelize')

module.exports = class OrderItem extends Sequelize.Model {
   static init(sequelize) {
      return super.init(
         {
            count: {
               type: DataTypes.INTEGER,
               allowNull: false,
            },
         },
         {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'OrderItem',
            tableName: 'order_item',
            paranoid: true,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
         }
      )
   }

   static associate(db) {
      OrderItem.belongsTo(db.Order, {
         foreignKey: 'order_id',
         targetKey: 'id',
         onDelete: 'CASCADE',
      })
      OrderItem.belongsTo(db.Item, {
         foreignKey: 'item_id',
         targetKey: 'id',
         onDelete: 'CASCADE',
      })
      OrderItem.belongsTo(db.ItemOption, {
         foreignKey: 'item_option_id',
         targetKey: 'id',
      })
   }
}
