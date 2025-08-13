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

            // 상호 법인명
            name: {
               type: DataTypes.STRING(100),
               allowNull: false,
               unique: true,
            },
            // 회사 소개
            introduce: {
               type: DataTypes.TEXT,
               allowNull: true,
            },
            // 대표 번호
            phone_number: {
               type: DataTypes.STRING(20),
               allowNull: false,
            },
            // 사본 업로드
            banner_img: {
               type: DataTypes.STRING(255),
               allowNull: true,
            },
            // 사업자 등록번호
            biz_reg_no: {
               type: DataTypes.STRING(20),
               allowNull: false,
               unique: true,
               validate: {
                  is: /^[0-9-]+$/i,
                  len: [10, 20], // 10자리~하이픈 포함 최대 20
               },
            },
            // 대표자 명
            representative_name: {
               type: DataTypes.STRING(50),
               allowNull: false,
            },
            // 대표 판매물품
            main_products: {
               type: DataTypes.STRING(255),
               allowNull: true,
            },
            // 사업장 주소
            business_address: {
               type: DataTypes.STRING(255),
               allowNull: true,
            },
            status: {
               type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
               allowNull: false,
               defaultValue: 'PENDING',
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

      Seller.belongsToMany(db.Hashtag, {
         through: 'seller_hashtag',
         foreignKey: 'seller_id',
         otherKey: 'hashtag_id',
         onDelete: 'CASCADE',
      })
   }
}
