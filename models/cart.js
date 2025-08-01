const { Sequelize, DataTypes } = require('sequelize')

module.exports = class Cart extends Sequelize.Model {
   static init(sequelize) {
      return super.init(
         {
            user_id: {
               type: DataTypes.INTEGER,
               primaryKey: true,
               reference: {
                  model: 'users',
                  key: 'id',
               },
            },
         },
         {
            sequelize,
            timestamps: false,
            underscored: false,
            modelName: 'Cart',
            paranoid: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
         }
      )
   }

   static associate(db) {
      Cart.belongsTo(db.User, {
         foreignKey: 'user_id',
         targetKey: 'id',
         onDelete: 'CASCADE',
      })
      Cart.belongsToMany(db.Item, {
         through: 'cart_item',
         foreignKey: 'user_id',
         otherKey: 'item_id',
         onDelete: 'CASCADE',
      })
   }
}
