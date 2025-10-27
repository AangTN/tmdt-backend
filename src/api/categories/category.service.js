const categoryRepository = require('./category.repository');

const getAllCategories = () => categoryRepository.findAllCategories();

module.exports = { getAllCategories };
