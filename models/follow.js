const { Sequelize, DataTypes } = require('sequelize')

module.exports = class Follow extends Sequelize.Model {
   static init(sequelize) {
      return super.init(
         {
            buyer_id: {
               type: DataTypes.INTEGER,
               primaryKey: true,
               references: {
                  model: 'users',
                  key: 'id',
               },
            },
            seller_id: {
               type: DataTypes.INTEGER,
               primaryKey: true,
               references: {
                  model: 'sellers',
                  key: 'id',
               },
            },
         },
         {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'Follow',
            paranoid: true,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
         }
      )
   }

   static associate(db) {
      Follow.belongsTo(db.Seller, {
         targetKey: 'id',
         foreignKey: 'seller_id',
         as: 'Seller',
         onDelete: 'CASCADE',
      })
      Follow.belongsTo(db.User, {
         targetKey: 'id',
         foreignKey: 'buyer_id',
         onDelete: 'CASCADE',
      })
   }
}
