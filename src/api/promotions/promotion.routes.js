const express = require('express');
const router = express.Router();
const promotionController = require('./promotion.controller');

// Lấy tất cả khuyến mãi
router.get('/', promotionController.getAllPromotions);

// Lấy các món ăn đang được giảm giá
router.get('/foods/discounted', promotionController.getDiscountedFoods);

module.exports = router;
