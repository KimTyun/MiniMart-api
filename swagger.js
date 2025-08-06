const swaggerJsdoc = require('swagger-jsdoc')

const options = {
   definition: {
      openapi: '3.0.0',
      info: {
         title: 'Minimart API',
         version: '1.0.0',
         description: 'Minimart 프로젝트의 API 문서입니다',
      },
      // 모든 API에 인증(자물쇠) UI를 추가하기 위한 설정
      components: {
         securitySchemes: {
            bearerAuth: {
               type: 'http',
               scheme: 'bearer',
               bearerFormat: 'JWT',
            },
         },
      },
      security: [
         {
            bearerAuth: [],
         },
      ],
   },
   // API 명세가 작성된 모든 js 파일의 경로를 알려줍니다.
   apis: ['./routes/**/*.js'],
}

const swaggerSpec = swaggerJsdoc(options)

module.exports = swaggerSpec
