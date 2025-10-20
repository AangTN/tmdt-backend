// src/api/pizzas/pizza.controller.js

const pizzaService = require('./pizza.service');

/**
 * Controller xử lý request lấy danh sách pizza.
 */
const getPizzas = async (req, res) => {
  try {
    // Gọi xuống service để thực hiện logic
    const pizzas = await pizzaService.getAllPizzas();

    // Gửi response thành công về cho client
    res.status(200).json(pizzas);
  } catch (error) {
    // Xử lý lỗi và gửi response lỗi
    console.error('Error in getPizzas controller:', error);
    res.status(500).json({ message: 'Lỗi server nội bộ' });
  }
};

module.exports = {
  getPizzas,
};