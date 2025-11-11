const express = require('express');
const router = express.Router();
const foodController = require('./food.controller');

// Danh sách món ăn (chỉ thông tin bảng MonAn)
router.get('/', foodController.getFoods);

// Top 8 món bán chạy nhất
router.get('/best-selling/top', foodController.getBestSelling);

// Các món ăn được đề xuất
router.get('/featured/all', foodController.getFeaturedFoods);

// Chi tiết món ăn
router.get('/:id', foodController.getFoodById);

module.exports = router;
