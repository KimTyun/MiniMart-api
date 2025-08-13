const { Sequelize, DataTypes } = require('sequelize')

module.exports = class ItemReview extends Sequelize.Model {
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
            content: {
               type: DataTypes.TEXT,
               allowNull: false,
            },
            img: {
               type: DataTypes.STRING(255),
               allowNull: true,
            },
            rating: {
               type: DataTypes.FLOAT,
               allowNull: false,
            },
         },
         {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'ItemReview',
            tableName: 'item_review',
            paranoid: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
         }
      )
   }

   static associate(db) {
      ItemReview.belongsTo(db.Seller, {
         targetKey: 'id',
         foreignKey: 'seller_id',
         onDelete: 'CASCADE',
      })
      ItemReview.belongsTo(db.User, {
         targetKey: 'id',
         foreignKey: 'buyer_id',
         onDelete: 'CASCADE',
      })
   }
}
