const express = require('express');
const router = express.Router();
const { listVouchers, getVoucher } = require('./voucher.controller');

router.get('/', listVouchers);
router.get('/:code', getVoucher);

module.exports = router;
