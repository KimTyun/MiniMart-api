const { Sequelize, DataTypes } = require('sequelize')

module.exports = class QnaBoard extends Sequelize.Model {
   static init(sequelize) {
      return super.init(
         {
            user_id: {
               type: DataTypes.INTEGER,
               allowNull: true,
               reference: {
                  model: 'users',
                  key: 'id',
               },
            },
            title: {
               type: DataTypes.STRING(255),
               allowNull: false,
            },
            q_content: {
               type: DataTypes.TEXT,
               allowNull: false,
            },
            is_public: {
               type: DataTypes.BOOLEAN,
               allowNull: false,
               defaultValue: true,
            },
            admin_id: {
               type: DataTypes.INTEGER,
               allowNull: true,
               reference: {
                  model: 'users',
                  key: 'id',
               },
            },
            a_content: {
               type: DataTypes.TEXT,
               allowNull: true,
            },
         },
         {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'QnaBoard',
            tableName: 'qna_board',
            paranoid: true,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
         }
      )
   }

   static associate(db) {
      QnaBoard.belongsTo(db.User, {
         foreignKey: 'user_id',
         targetKey: 'id',
         as: 'Questions',
      })
      QnaBoard.belongsTo(db.User, {
         foreignKey: 'admin_id',
         targetKey: 'id',
         as: 'Answers',
      })
      QnaBoard.hasMany(db.QnaBoardImg, {
         foreignKey: 'qna_board_id',
         sourceKey: 'id',
      })
   }
}
