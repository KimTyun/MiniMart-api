const { Sequelize, DataTypes } = require('sequelize')

module.exports = class Seller extends Sequelize.Model {
   static init(sequelize) {
      return super.init(
         {
            id: {
               type: DataTypes.INTEGER,
               primaryKey: true,
               reference: {
                  model: 'users',
                  key: 'id',
               },
            },
            name: {
               type: DataTypes.STRING(100),
               allowNull: false,
               unique: true,
            },
            introduce: {
               type: DataTypes.TEXT,
               allowNull: true,
            },
            phone_number: {
               type: DataTypes.STRING(20),
               allowNull: false,
            },
            banner_img: {
               type: DataTypes.STRING(255),
               allowNull: true,
            },
         },
         {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'Seller',
            tableName: 'sellers',
            paranoid: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
         }
      )
   }

   static associate(db) {
      Seller.belongsTo(db.User, {
         foreignKey: 'id',
         targetKey: 'id',
         onDelete: 'CASCADE',
      })
      Seller.hasMany(db.Item, {
         foreignKey: 'seller_id',
         targetKey: 'id',
      })

      Seller.hasMany(db.Follow, {
         sourceKey: 'id',
         foreignKey: 'seller_id',
      })
      Seller.hasMany(db.Chat, {
         sourceKey: 'id',
         foreignKey: 'seller_id',
      })
   }
}
