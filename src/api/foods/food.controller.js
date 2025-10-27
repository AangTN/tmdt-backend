const foodService = require('./food.service');

const getFoods = async (req, res) => {
  try {
    const foods = await foodService.getAllFoods();
    res.status(200).json(foods);
  } catch (error) {
    console.error('Error in getFoods controller:', error);
    res.status(500).json({ message: 'Lỗi server nội bộ' });
  }
};

const getFoodById = async (req, res) => {
  try {
    const id = req.params.id;
    const food = await foodService.getFoodDetail(id);
    if (!food) return res.status(404).json({ message: 'Không tìm thấy món ăn' });
    res.status(200).json(food);
  } catch (error) {
    console.error('Error in getFoodById controller:', error);
    res.status(500).json({ message: 'Lỗi server nội bộ' });
  }
};

module.exports = { getFoods, getFoodById };
