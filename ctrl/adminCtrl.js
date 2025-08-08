exports.approveSeller = (req, res) => {
   res.send('판매자 자격 승인')
}

exports.getAllUsers = (req, res) => {
   res.send('사용자 전체 목록')
}

exports.editUserInfo = (req, res) => {
   res.send('사용자 정보 수정')
}

exports.deleteUser = (req, res) => {
   res.send('사용자 삭제')
}

exports.getAllOrders = (req, res) => {
   res.send('주문 전체 목록')
}

exports.editOrderInfo = (req, res) => {
   res.send('주문 수정(관리자)')
}

exports.deleteOrder = (req, res) => {
   res.send('주문 삭제(관리자)')
}

exports.answerQna = (req, res) => {
   res.send('문의 답변')
}
