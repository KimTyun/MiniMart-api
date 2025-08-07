const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
   service: 'gmail',
   auth: {
      user: 'your_email@gmail.com',
      pass: 'your_app_password', // 앱 비밀번호
   },
})

module.exports = transporter
