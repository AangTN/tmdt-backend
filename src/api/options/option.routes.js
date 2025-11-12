const express = require('express');
const router = express.Router();
const optionController = require('./option.controller');

// Get all option types with options and pricing
router.get('/', optionController.getAllOptions);

module.exports = router;
