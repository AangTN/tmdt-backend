// src/api/pizzas/pizza.service.js

const pizzaRepository = require('./pizza.repository');

/**
 * Service để lấy danh sách tất cả pizza.
 * Chứa các logic nghiệp vụ nếu có.
 */
const getAllPizzas = async () => {
  // Gọi xuống repository để lấy dữ liệu thô
  const pizzas = await pizzaRepository.findAllPizzas();
  return pizzas;
};

module.exports = {
  getAllPizzas,
};