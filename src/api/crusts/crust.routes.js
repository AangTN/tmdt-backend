const express = require('express');
const router = express.Router();
const { getCrusts } = require('./crust.controller');

router.get('/', getCrusts);

module.exports = router;
