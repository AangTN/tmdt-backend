const express = require('express');
const controller = require('./payment.controller');

const router = express.Router();

// VNPay return URL
router.get('/vnpay-return', controller.vnpayReturn);

module.exports = router;
