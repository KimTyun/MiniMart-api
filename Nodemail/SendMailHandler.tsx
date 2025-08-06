//SendMailHandler.tsx

import { NextApiRequest, NextApiResponse } from 'next'
import { handleMySql } from './HandleUser'
import { timeToString, timeFormat, generateRandomChar } from '@/utils/CommonUtils'
import nodemailer from 'nodemailer'

export default async function SendMailHandler(request: NextApiRequest, response: NextApiResponse) {
   const params = request.body.data
   const toMailAddress = params.mailAddress // 사용자가 입력한 메일주소
   //숫자를 랜덤하게 섞은 인증번호 6자리 생성
   const verifyCode = generateRandomChar(6, 'mailcode')
   const expireTime = new Date(Date.now() + 1000 * 60 * 60 * 24) // 만료시간 24시간
   const expireTimeToStr = timeToString(expireTime)

   const mailOptions = {
      from: 'verify@keylog.io',
      to: toMailAddress,
      subject: 'Keylog 회원가입 인증번호',
      text: `
          Keylog 회원가입을 위한 인증번호입니다.
        
          아래의 인증번호를 입력하여 인증을 완료해주세요.
        
          인증번호 : ${verifyCode}
        
          인증번호는 ${timeFormat(expireTimeToStr)}까지 유효합니다.
          `,
   }

   try {
      await transporter.sendMail(mailOptions)
      //DB에인증번호, 만료시간 저장
      params.type = 'insertVerifyCode'
      params.verifyCode = verifyCode
      params.expireTime = expireTimeToStr
      params.rgsnDttm = timeToString(new Date())
      const veryfyCodeId = await handleMySql(params)

      response.status(200).json(veryfyCodeId)
   } catch (error) {
      console.log(error)
   }
}

import { NextApiRequest, NextApiResponse } from 'next';
import { handleMySql } from './HandleUser';
import { timeToString, timeFormat, generateRandomChar } from '@/utils/CommonUtils';
import nodemailer from 'nodemailer';

export default async function SendMailHandler(request: NextApiRequest, response: NextApiResponse) {
  const params = request.body.data;

  const transporter = nodemailer.createTransport({
    service: process.env.MAIL_SERVICE,
    auth: {
      user: process.env.MAIL_ADDRESS,
      pass: process.env.MAIL_PASSWORD,
    },
  });
  
  params.type = 'getUser';
  const user = await handleMySql(params).items[0]; // 사용자 정보 가져옴
  const crypto = require('crypto');
   
  if (user.totalItems > 0) {
    const token = crypto.randomBytes(20).toString('hex'); //토큰 생성
    const expireTime = timeToString(new Date(Date.now() + 1000 * 60 * 30)); // 만료시간 30분
    const url = `http://localhost:3000/resetPassword/${token}`; // 링크 클릭시 비밀번호를 변경할 화면 RL

    mailOptions = {
      from: 'verify@keylog.io',
      to: user.user_email,
      subject: 'Keylog 비밀번호 변경 인증 메일',
      html:`
           안녕하세요 ${user.user_nickname}님<br><br>
    
           계정 비밀번호를 재설정하기 위해 아래의 링크를 클릭하여 주세요.<br><br>
              
           <a href='` +url +`'>비밀번호 재설정</a><br><br>
              
           위 링크는 ${timeFormat(expireTime)}까지 유효합니다.
          `,
        };

        try {
          await transporter.sendMail(mailOptions); // 메일 전송
          //DB에 토큰과 사용자ID, 만료시간을 저장
          params.type = 'insertUserToken';
          params.token = token;
          params.id = user.user_id;
          params.expireTime = expireTime;
          params.rgsnDttm = timeToString(new Date());
          await handleMySql(params);
        } catch (error) {
          console.log(error);
        }
      }
      response.status(200).json(user);