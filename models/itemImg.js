const { Sequelize, DataTypes } = require('sequelize')

module.exports = class ItemImg extends Sequelize.Model {
   static init(sequelize) {
      return super.init(
         {
            img_url: {
               type: DataTypes.STRING(255),
               allowNull: false,
            },
            rep_img_yn: {
               type: DataTypes.BOOLEAN,
               allowNull: false,
               defaultValue: false,
            },
            details_img_yn: {
               type: DataTypes.BOOLEAN,
               allowNull: false,
               defaultValue: false,
            },
         },
         {
            sequelize,
            timestamps: false,
            underscored: false,
            modelName: 'ItemImg',
            tableName: 'item_img',
            paranoid: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
         }
      )
   }

   static associate(db) {
      ItemImg.belongsTo(db.Item, {
         foreignKey: 'item_id',
         targetKey: 'id',
      })
   }
}
