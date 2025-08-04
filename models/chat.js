const { Sequelize, DataTypes } = require('sequelize')

module.exports = class Chat extends Sequelize.Model {
   static init(sequelize) {
      return super.init(
         {
            is_blocked: {
               type: DataTypes.BOOLEAN,
               allowNull: false,
               defaultValue: false,
            },
         },
         {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'Chat',
            tableName: 'chats',
            paranoid: true,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
         }
      )
   }

   static associate(db) {
      Chat.belongsTo(db.User, {
         foreignKey: 'buyer_id',
         sourceKey: 'id',
      })
      Chat.belongsTo(db.Seller, {
         foreignKey: 'seller_id',
         sourceKey: 'id',
      })
      Chat.hasMany(db.ChatMessage, {
         foreignKey: 'chat_id',
         targetKey: 'id',
      })
   }
}
