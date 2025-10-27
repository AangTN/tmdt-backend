const express = require('express');
const router = express.Router();
const foodController = require('./food.controller');

// Danh sách món ăn (chỉ thông tin bảng MonAn)
router.get('/', foodController.getFoods);

// Chi tiết món ăn
router.get('/:id', foodController.getFoodById);

module.exports = router;
