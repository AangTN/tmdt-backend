const express = require('express');
const router = express.Router();
const { getCrusts, createCrust } = require('./crust.controller');

router.get('/', getCrusts);
router.post('/', createCrust);

module.exports = router;
