require('dotenv').config() // .env 파일 로드

/*
mysql 타임존 변경(KST로 맞춰줌) 쿼리문 실행 -  Korea Standard Time(한국 표준시)
SET GLOBAL time_zone = '+09:00';
SET SESSION time_zone = '+09:00';
*/

module.exports = {
   development: {
      username: process.env.DB_DEV_USERNAME,
      password: process.env.DB_DEV_PASSWORD,
      database: process.env.DB_DEV_NAME,
      host: process.env.DB_DEV_HOST,
      dialect: process.env.DB_DEV_DIALECT || 'mysql',
      timezone: '+09:00', // KST로 설정
   },
   test: {
      username: process.env.DB_TEST_USERNAME,
      password: process.env.DB_TEST_PASSWORD,
      database: process.env.DB_TEST_NAME,
      host: process.env.DB_TEST_HOST,
      dialect: process.env.DB_TEST_DIALECT,
      timezone: '+09:00', // KST로 설정
   },
   production: {
      username: process.env.DB_PRO_USERNAME,
      password: process.env.DB_PRO_PASSWORD,
      database: process.env.DB_PRO_NAME,
      host: process.env.DB_PRO_HOST,
      dialect: process.env.DB_PRO_DIALECT,
      timezone: '+09:00', // KST로 설정
   },
}
