const { Sequelize, DataTypes } = require('sequelize')

module.exports = class QnaBoardImg extends Sequelize.Model {
   static init(sequelize) {
      return super.init(
         {
            img: {
               type: DataTypes.STRING(255),
               allowNull: false,
            },
         },
         {
            sequelize,
            timestamps: false,
            underscored: false,
            modelName: 'QnaBoardImg',
            tableName: 'qna_board_img',
            paranoid: true,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
         }
      )
   }

   static associate(db) {
      QnaBoardImg.belongsTo(db.QnaBoard, {
         foreignKey: 'qna_board_id',
         targetKey: 'id',
      })
   }
}
