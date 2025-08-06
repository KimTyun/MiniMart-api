const ROLE = {
   BUYER: 1, // 001
   SELLER: 2, // 010
   ADMIN: 4, // 100
   ALL: 7,
}
const ROLE_MAP = {
   BUYER: ROLE.BUYER,
   SELLER: ROLE.SELLER,
   ADMIN: ROLE.ADMIN,
}

module.exports = { ROLE, ROLE_MAP }
