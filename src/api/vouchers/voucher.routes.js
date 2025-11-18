const express = require('express');
const router = express.Router();
const { listVouchers, getVoucher, createVoucher, updateVoucher, toggleVoucherStatus, giftVoucher } = require('./voucher.controller');

router.get('/', listVouchers);
router.get('/:code', getVoucher);
router.post('/', createVoucher);
router.post('/gift', giftVoucher);
router.put('/:code', updateVoucher);
router.patch('/:code/status', toggleVoucherStatus);

module.exports = router;
