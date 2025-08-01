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
            },
            is_sale: {
               type: DataTypes.BOOLEAN,
               allowNull: false,
            },
            sale_per: {
               type: DataTypes.FLOAT,
               allowNull: true,
            },
         },
         {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'Item',
            tableName: 'Items',
            paranoid: true,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
         }
      )
   }

   static associate(db) {
      Item.belongsTo(db.seller, {
         foreignKey: 'seller_id',
         targetKey: 'id',
      })
   }
}
