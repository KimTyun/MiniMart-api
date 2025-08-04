const swaggerJSDoc = require('swagger-jsdoc')

const options = {
   definition: {
      openapi: '3.0.0',
      info: {
         title: 'Minimart API',
         version: '1.0.0',
         description: 'Minimart 프로젝트의 API 문서입니다',
      },
      servers: [
         {
            url: 'http://localhost:8000',
         },
      ],
   },
   apis: ['./routes/*.js', './ctrl/*.js'], // 주석으로 문서화할 파일 위치
}

const swaggerSpec = swaggerJSDoc(options)
module.exports = swaggerSpec
