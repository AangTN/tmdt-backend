const promotionService = require('./promotion.service');

const getAllPromotions = async (req, res) => {
  try {
    const promotions = await promotionService.getAllPromotions();
    res.status(200).json(promotions);
  } catch (error) {
    console.error('Error in getAllPromotions controller:', error);
    res.status(500).json({ message: 'Lỗi server nội bộ' });
  }
};

const getDiscountedFoods = async (req, res) => {
  try {
    const foods = await promotionService.getDiscountedFoods();
    res.status(200).json(foods);
  } catch (error) {
    console.error('Error in getDiscountedFoods controller:', error);
    res.status(500).json({ message: 'Lỗi server nội bộ' });
  }
};

module.exports = {
  getAllPromotions,
  getDiscountedFoods,
};
