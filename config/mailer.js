const nodemailer = require('nodemailer')
require('dotenv').config()

const transporter = nodemailer.createTransport({
   service: 'gmail',
   host: 'smtp.gmail.com',
   port: 587,
   secure: false,
   auth: {
      user: 'only05250517@gmail.com',
      pass: 'ceoo vvxo opeo polp',
   },
})

const sendMail = async (mailOptions) => {
   return transporter.sendMail(mailOptions)
}

module.exports = {
   sendMail,
}
