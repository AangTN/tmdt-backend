const express = require('express');
const controller = require('./user.controller');

const router = express.Router();

// GET /api/users/:id - Lấy thông tin người dùng
router.get('/:id', controller.getUserProfile);

// PUT /api/users - Cập nhật thông tin người dùng
router.put('/', controller.updateUserProfile);

// POST /api/users/:id/block - Khóa tài khoản
router.post('/:id/block', controller.blockUser);

// POST /api/users/:id/unblock - Mở khóa tài khoản
router.post('/:id/unblock', controller.unblockUser);

// GET /api/users/admin/all-accounts - Lấy tất cả tài khoản với thống kê đơn hàng
router.get('/admin/all-accounts', controller.getAllAccounts);

module.exports = router;
