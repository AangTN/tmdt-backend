const express = require('express');
const router = express.Router();
const comboController = require('./combo.controller');

// Danh sách combo Active
router.get('/', comboController.getCombos);

// Chi tiết combo theo id (đủ thông tin liên quan)
router.get('/:id', comboController.getComboById);

module.exports = router;