mport { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

export default async function SendMailHandler(request: NextApiRequest, response: NextApiResponse) {
  const params = request.body.data;
  let mailOptions;

  const transporter = nodemailer.createTransport({
    service: process.env.MAIL_SERVICE,
    auth: {
      user: process.env.MAIL_ADDRESS,
      pass: process.env.MAIL_PASSWORD,
    },
  });
  
  mailOptions = {
          from: process.env.MAIL_ADDRESS,
          to: 'abc123@mail.com', 
          subject: '메일 제목',
          text: '메일내용',
       // html: '<div><h1>메일내용</h1></div>'
        };

  await transporter.sendMail(mailOptions); // 메일 전송
  
  };