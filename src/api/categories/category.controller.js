const categoryService = require('./category.service');

const getCategories = async (req, res) => {
  try {
    const categories = await categoryService.getAllCategories();
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error in getCategories controller:', error);
    res.status(500).json({ message: 'Lỗi server nội bộ' });
  }
};

module.exports = { getCategories };
