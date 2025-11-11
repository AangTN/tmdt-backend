const express = require('express');
const controller = require('./auth.controller');

const router = express.Router();

router.post('/register', controller.register);
router.post('/login', controller.login);
router.post('/admin/login', controller.adminLogin);

module.exports = router;
