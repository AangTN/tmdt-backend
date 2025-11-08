const express = require('express');
const controller = require('./user.controller');

const router = express.Router();

// GET /api/users/:id - Lấy thông tin người dùng
router.get('/:id', controller.getUserProfile);

// PUT /api/users - Cập nhật thông tin người dùng
router.put('/', controller.updateUserProfile);

module.exports = router;
