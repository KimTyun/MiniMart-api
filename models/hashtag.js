const { Sequelize, DataTypes } = require('sequelize')

module.exports = class Hashtag extends Sequelize.Model {
   static init(sequelize) {
      return super.init(
         {
            content: {
               type: DataTypes.STRING(100),
               allowNull: false,
            },
         },
         {
            sequelize,
            timestamps: false,
            underscored: false,
            modelName: 'Hashtag',
            tableName: 'hashtags',
            paranoid: true,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
         }
      )
   }

   static associate(db) {
      Hashtag.belongsToMany(db.Item, {
         through: 'item_hashtag',
         foreignKey: 'hashtag_id',
         otherKey: 'item_id',
         onDelete: 'CASCADE',
      })
      Hashtag.belongsToMany(db.Seller, {
         through: 'seller_hashtag',
         foreignKey: 'hashtag_id',
         otherKey: 'seller_id',
         onDelete: 'CASCADE',
      })
   }
}
