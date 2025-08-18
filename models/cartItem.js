const { Sequelize, DataTypes } = require('sequelize')

module.exports = class CartItem extends Sequelize.Model {
   static init(sequelize) {
      return super.init(
         {
            id: {
               type: DataTypes.INTEGER,
               autoIncrement: true,
               primaryKey: true,
            },
            count: {
               type: DataTypes.INTEGER,
               allowNull: false,
            },
            item_option_id: {
               type: DataTypes.INTEGER,
               references: {
                  model: 'item_option',
                  key: 'id',
               },
            },
            user_id: {
               type: DataTypes.INTEGER,
               references: {
                  model: 'carts',
                  key: 'user_id',
               },
            },
            item_id: {
               type: DataTypes.INTEGER,
               references: {
                  model: 'items',
                  key: 'id',
               },
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
            indexes: [
               {
                  unique: true,
                  fields: ['user_id', 'item_id', 'item_option_id'], // ✅ 복합 UNIQUE
                  name: 'uq_cart',
               },
            ],
         },
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
