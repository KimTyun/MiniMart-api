const { Sequelize, DataTypes } = require('sequelize')

module.exports = class ItemReview extends Sequelize.Model {
   static init(sequelize) {
      return super.init(
         {
            id: {
               type: DataTypes.INTEGER,
               autoIncrement: true,
               primaryKey: true,
            },
            buyer_id: {
               type: DataTypes.INTEGER,
               allowNull: false,
               references: {
                  model: 'users',
                  key: 'id',
               },
            },
            seller_id: {
               type: DataTypes.INTEGER,
               allowNull: false,
               references: {
                  model: 'sellers',
                  key: 'id',
               },
            },
            item_id: {
               type: DataTypes.INTEGER,
               allowNull: false,
               references: {
                  model: 'items',
                  key: 'id',
               },
            },
            content: {
               type: DataTypes.TEXT,
               allowNull: false,
            },
            img: {
               type: DataTypes.STRING(255), // 한 장만 저장
               allowNull: true,
            },
            rating: {
               type: DataTypes.DECIMAL(2, 1), // 예: 4.5
               allowNull: false,
               validate: {
                  min: 0,
                  max: 5,
               },
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
      ItemReview.belongsTo(db.Item, {
         targetKey: 'id',
         foreignKey: 'item_id',
         onDelete: 'CASCADE',
      })
   }
}
