const express = require('express');
const router = express.Router();
const typeController = require('./type.controller');

router.get('/', typeController.getTypes);

module.exports = router;
