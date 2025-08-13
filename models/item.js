const { Sequelize, DataTypes } = require('sequelize')

module.exports = class Item extends Sequelize.Model {
   static init(sequelize) {
      return super.init(
         {
            name: {
               type: DataTypes.STRING(255),
               allowNull: false,
            },
            price: {
               type: DataTypes.INTEGER,
               allowNull: false,
            },
            stock_number: {
               type: DataTypes.INTEGER,
               allowNull: false,
            },
            description: {
               type: DataTypes.TEXT,
               allowNull: true,
            },
            status: {
               type: DataTypes.ENUM('FOR_SALE', 'SOLD_OUT', 'DISCONTINUED'),
               defaultValue: 'FOR_SALE',
            },
            is_sale: {
               type: DataTypes.BOOLEAN,
               allowNull: false,
               defaultValue: false,
            },
            sale: {
               type: DataTypes.INTEGER,
               allowNull: true,
            },
         },
         {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'Item',
            tableName: 'items',
            paranoid: true,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
         }
      )
   }

   static associate(db) {
      Item.belongsTo(db.Seller, {
         foreignKey: 'seller_id',
         targetKey: 'id',
      })
      Item.hasMany(db.ItemImg, {
         foreignKey: 'item_id',
         sourceKey: 'id',
      })
      Item.hasMany(db.ItemOption, {
         foreignKey: 'item_id',
         sourceKey: 'id',
      })
      Item.hasMany(db.OrderItem, {
         foreignKey: 'item_id',
         sourceKey: 'id',
      })
      Item.belongsToMany(db.Hashtag, {
         through: 'item_hashtag',
         foreignKey: 'item_id',
         otherKey: 'hashtag_id',
         onDelete: 'CASCADE',
      })
   }
}
