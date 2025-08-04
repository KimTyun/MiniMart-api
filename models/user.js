const { Sequelize, DataTypes } = require('sequelize')

module.exports = class User extends Sequelize.Model {
   static init(sequelize) {
      return super.init(
         {
            email: {
               type: DataTypes.STRING(100),
               allowNull: false,
               unique: true,
            },
            password: {
               type: DataTypes.STRING(255),
               allowNull: true,
            },
            address: {
               type: DataTypes.STRING(255),
               allowNull: true,
            },
            phone_number: {
               type: DataTypes.STRING(13),
               allowNull: true,
            },
            profile_img: {
               type: DataTypes.STRING(255),
               allowNull: true,
            },
            provider: {
               type: DataTypes.ENUM('LOCAL', 'GOOGLE', 'KAKAO'),
               allowNull: false,
            },
            role: {
               type: DataTypes.ENUM('BUYER', 'SELLER', 'ADMIN'),
            },
         },
         {
            sequelize,
            timestamps: true, //createdAt, updatedAt ..등 자동 생성
            underscored: false,
            modelName: 'User',
            tableName: 'users',
            paranoid: false, //deletedAt 사용 X
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
         }
      )
   }

   static associate(db) {
      User.hasOne(db.Seller, {
         foreignKey: 'id',
         sourceKey: 'id',
      })

      User.hasMany(db.Cart, {
         foreignKey: 'user_id',
         sourceKey: 'id',
      })
      User.hasMany(db.Follow, {
         sourceKey: 'id',
         foreignKey: 'buyer_id',
      })
      User.hasMany(db.Order, {
         sourceKey: 'id',
         foreignKey: 'buyer_id',
      })
      User.hasMany(db.Chat, {
         sourceKey: 'id',
         foreignKey: 'buyer_id',
      })
   }
}
