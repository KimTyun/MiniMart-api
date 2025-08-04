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
            req_item_yn: {
               type: DataTypes.BOOLEAN,
               allowNull: false,
            },
         },
         {
            sequelize,
            timestamps: false,
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
   }
}
