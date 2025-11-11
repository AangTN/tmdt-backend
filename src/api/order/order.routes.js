const express = require('express');
const router = express.Router();
const {
  createOrder,
  getAllOrders,
  getOrderById,
  getOrdersByUserId,
  getOrdersByBranchId,
  getOrdersByPhone,
  cancelOrder,
  rateOrder,
  getOrderReview,
} = require('./order.controller');

// Create order
router.post('/', createOrder);
// Order of routes matters: specific before generic :id
router.get('/user/:userId', getOrdersByUserId);
router.get('/branch/:branchId', getOrdersByBranchId);
router.get('/phone/:phone', getOrdersByPhone);
router.get('/', getAllOrders);
// Cancel order (customer)
router.post('/:id/cancel', cancelOrder);
// Rate order - POST /api/orders/:id/rate
router.post('/:id/rate', rateOrder);
// Get order review - GET /api/orders/:id/review
router.get('/:id/review', getOrderReview);
router.get('/:id', getOrderById);

module.exports = router;

