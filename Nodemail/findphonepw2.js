// (Nodemailer를 사용해 실제 이메일을 보내는 부분입니다)
//nodemailer 완성 시 이 파일 작동 확인, 일정이 늦어지면 아래 주석처리된 코드 검토 후 사용

const nodemailer = require('nodemailer')

// 1. 메일 서버에 대한 접속 정보를 설정합니다.
const transporter = nodemailer.createTransport({
   service: 'gmail', // 예: 'gmail', 'naver', 'daum' 등
   host: 'smtp.gmail.com', // Gmail의 경우
   port: 587,
   secure: false,
   auth: {
      user: process.env.EMAIL_USER, // .env 파일에 설정된 구글 아이디
      pass: process.env.EMAIL_PASS, // .env 파일에 설정된 구글 앱 비밀번호
   },
})

// 2. 비밀번호 초기화 인증 코드를 보내는 함수
exports.sendPasswordResetCode = async (to, code) => {
   try {
      const mailOptions = {
         from: `미니마트 <${process.env.EMAIL_USER}>`,
         to: to,
         subject: '[미니마트] 비밀번호 재설정 인증 코드입니다.',
         html: `
                <div style="font-family: sans-serif; text-align: center; padding: 20px;">
                    <h2>비밀번호 재설정 인증 코드</h2>
                    <p>아래 인증 코드를 입력하여 비밀번호 재설정을 완료해주세요.</p>
                    <p style="font-size: 24px; font-weight: bold; letter-spacing: 5px; background-color: #f1f1f1; padding: 10px; border-radius: 5px;">
                        ${code}
                    </p>
                    <p>이 코드는 10분간 유효합니다.</p>
                </div>
            `,
      }

      await transporter.sendMail(mailOptions)
      console.log(`[메일 발송 성공] 받는 사람: ${to}, 인증 코드: ${code}`)
   } catch (error) {
      console.error('[메일 발송 실패]', error)
      // 여기서 에러를 던져야 sendResetEmail 컨트롤러에서 에러를 잡을 수 있습니다.
      throw new Error('이메일 발송에 실패했습니다.')
   }
}

/*
//전화번호 검증 및 Token 생성
$('.send-btn').click(function (e) {
   const email = document.getElementsByName('email')[0].ariaValueMax;
   sendAjax('/users/password-reset', { email: email });
   e.preventDefault();
})

function sendAjax(url, data) {
   let jsondata = JSON.stringify(data);
   const xhr = new XMLHttpRequest();
   xhr.open('POST', url);
   xhr.setRequestHeader('Content-Type', 'application/json');
   xhr.send(jsondata);
}

export default sendAjax;url, data

app.post('/password-reset', function (req, res) {
	//Database에서 요청받은 Email이 존재하는지 확인
	const emailId = await UserStorage.verfiedEmail(req.body.email);
	if (emailId) {
		// Data가 존재한다면 해당 Email의 id 값과 생성한 token 및 TTL(Time To Live)
		// 값을 인자로 하는 parameter을 생성하여 Database에 입력
		const token = crypto.randomBytes(20).toString('hex');
		const data = [emailId[0].id, token, 300]; //token, email의 userId, TTL 값
		await UserStorage.createAuthToken(data);
		//...(아래에서 계속 진행)
	} else {
		return res.send({success:false, message:'존재하지 않는 이메일입니다'});
        }

//Nodemailer Module을 통해 비밀번호 초기화 링크 발송
   const transporter = nodemailer.createTransport({
          service: 'gmail',	//gmail service 사용
          port: 465,	//465 port를 통해 요청 전송
          secure: true,	//보안모드 사용
          auth: {	//gmail ID 및 password
            user: process.env.GMAIL_ID,
            pass: process.env.GMAIL_PASSWORD,
          },
        });
        const emailOptions = {	//비밀번호 초기화를 보내는 이메일의 Option
          from: process.env.GMAIL_ID,	//관리자 Email
          to: req.body.email,	//비밀번호 초기화 요청 유저 Email
          subject: 'OMG 비밀번호 초기화 메일',	//보내는 메일의 제목
          html:	//보내는 메일의 내용
            '<p>비밀번호 초기화를 위해 아래의 URL을 클릭하여 주세요.</p>' +
            `<a href="http://localhost:3000/users/reset/${token}">비밀번호 재설정 링크</a>`,
        };
        transporter.sendMail(emailOptions);	//요청 전송
        return res.send({success: true});
	});
});


//3. HTML 페이지에서 재설정한 비밀번호 및 TOKEN과 함께 POST 요청
const token = '<%=token %>';
$('.send-btn').click(function (e) {
   const passwd = $('#password').val();
   const passwdConfirm = $('#password-confirm').val();
   const passwdReset = sendAjax('/users/password-setting',
      { passwd: passwd, passwdConfirm: passwdConfirm, token: token });
   e.preventDefault();
});

//Token 검증 및 비밀번호 업데이트
app.post('/password-setting', function(req, res) {
	try { //token을 검증하여주고, token을 생성한 userId를 얻어 해당 Id의 password를 재설정한 비밀번호를 암호화 하여 저장하여준다.
		const hashedPassword = crypto.createHash('sha512').update(req.body.passwd).digest('hex');
		const userInfoByToken = await UserStorage.getUserIdByToken(req.body.token); //DB에 해당 token이 존재하는지 확인
		const params = [hashedPassword, userInfoByToken[0].userId]; //token이 존재한다면 token을 생성한 userId를 가져옴.
		if (userInfoByToken[0].valid) {	//Token이 생성된 시간 + TTL 값이 현재 시간보다 작으면 token의 유효기간이 만료.
			const passwdResetResult = await UserStorage.settingPasswd(params);
			return res.send({success: true});
		} else return res.send({success: false, message: '비밀번호 재설정 시간이 초과되었습니다.'});
	} catch (err) {
		return return res.send({success: false, message: 'Error'});
	}
});

*/
