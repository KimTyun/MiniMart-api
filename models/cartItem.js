const { Sequelize, DataTypes } = require('sequelize')

module.exports = class CartItem extends Sequelize.Model {
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
            timestamps: false,
            underscored: false,
            modelName: 'CartItem',
            tableName: 'cart_item',
            paranoid: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
         }
      )
   }

   static associate(db) {
      CartItem.belongsTo(db.Cart, {
         foreignKey: 'user_id',
         targetKey: 'user_id',
         onDelete: 'CASCADE',
      })
      CartItem.belongsTo(db.Item, {
         foreignKey: 'item_id',
         targetKey: 'id',
         onDelete: 'CASCADE',
      })
      CartItem.belongsTo(db.ItemOption, {
         foreignKey: 'item_option_id',
         targetKey: 'id',
         onDelete: 'CASCADE',
      })
   }
}
