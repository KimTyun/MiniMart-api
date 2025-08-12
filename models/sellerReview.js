const { Sequelize, DataTypes } = require('sequelize')

module.exports = class SellerReview extends Sequelize.Model {
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
            modelName: 'SellerReview',
            tableName: 'seller_review',
            paranoid: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
         }
      )
   }

   static associate(db) {
      SellerReview.belongsTo(db.Seller, {
         targetKey: 'id',
         foreignKey: 'seller_id',
         onDelete: 'CASCADE',
      })
      SellerReview.belongsTo(db.User, {
         targetKey: 'id',
         foreignKey: 'buyer_id',
         onDelete: 'CASCADE',
      })
   }
}
