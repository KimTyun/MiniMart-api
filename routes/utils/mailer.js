const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
   service: 'gmail',
   auth: {
      user: process.env.EMAIL_USER, // .env에 정의
      pass: process.env.EMAIL_PASS, // 앱 비밀번호 등
   },
})

exports.sendMail = async ({ to, subject, text }) => {
   await transporter.sendMail({
      from: `"MiniMart" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
   })
}
