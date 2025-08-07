import { handleMySql } from './HandleUser'
import { NextApiRequest, NextApiResponse } from 'next'
import { timeToString } from '@/utils/CommonUtils'

const CheckVerifyToken = async (request: NextApiRequest, response: NextApiResponse) => {
   const params = request.body.data
   const token = params.token //url에 포함되어있던 토큰
   const password = params.password // 사용자가 입력한 새 비밀번호

   const isValid = await handleMySql({ type: 'getUserToken', token: token, password: password }).then(async (res) => {
      const tokenInfo = res.items[0]
      const currTime = timeToString(new Date()) // 현재시간:YYYYMMDDHHMMSS
      //DB에 해당 토큰정보가 있고 만료시간안이라면 비밀번호 업데이트
      if (res.totalItems > 0 && currTime <= tokenInfo.EXPIRE_TIME) {
         const userId = tokenInfo.USER_ID

         //사용한 토큰은 삭제
         handleMySql({ type: 'deleteUserToken', token: token, id: userId })

         return await handleMySql({ type: 'updatePassword', id: userId, amntDttm: currTime, password: password }).then((res) => {
            return true
         })
      } else {
         return false
      }
   })

   return response.status(200).json({ isValid })
}

export default CheckVerifyToken
