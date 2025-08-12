const { Sequelize, DataTypes } = require('sequelize')

module.exports = class ItemOption extends Sequelize.Model {
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
            rep_item_yn: {
               type: DataTypes.BOOLEAN,
               allowNull: false,
               defaultValue: false,
            },
         },
         {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'ItemOption',
            tableName: 'item_option',
            paranoid: true,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
         }
      )
   }

   static associate(db) {
      ItemOption.belongsTo(db.Item, {
         foreignKey: 'item_id',
         targetKey: 'id',
      })
      ItemOption.hasOne(db.OrderItem, {
         foreignKey: 'item_option_id',
         sourceKey: 'id',
      })
   }
}
