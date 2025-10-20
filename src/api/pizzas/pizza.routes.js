// src/api/pizzas/pizza.routes.js

const express = require('express');
const router = express.Router();
const pizzaController = require('./pizza.controller');

// Định nghĩa route GET để lấy danh sách pizza
// Khi có request đến '/', nó sẽ được xử lý bởi hàm getPizzas trong controller
router.get('/', pizzaController.getPizzas);

module.exports = router;