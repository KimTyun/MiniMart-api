const express = require('express')
const router = express.Router()
const searchCtrl = require('../../ctrl/searchCtrl')

router.get('/', searchCtrl.searchItems)

module.exports = router
