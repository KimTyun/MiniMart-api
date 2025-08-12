const { Sequelize, DataTypes } = require('sequelize')

module.exports = class ChatMessage extends Sequelize.Model {
   static init(sequelize) {
      return super.init(
         {
            content: {
               type: DataTypes.STRING(255),
               allowNull: false,
            },
            writer: {
               type: DataTypes.ENUM('BUYER', 'SELLER'),
               allowNull: false,
            },
         },
         {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'ChatMessage',
            tableName: 'chat_message',
            paranoid: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
         }
      )
   }

   static associate(db) {
      ChatMessage.belongsTo(db.Chat, {
         foreignKey: 'chat_id',
         targetKey: 'id',
      })
   }
}
