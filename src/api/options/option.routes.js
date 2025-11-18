const express = require('express');
const router = express.Router();
const optionController = require('./option.controller');

// Get all option types with options and pricing (for public)
router.get('/', optionController.getAllOptions);

// Admin routes
router.get('/admin', optionController.getAllOptionsAdmin);
router.get('/sizes', optionController.getAllSizes);
router.get('/types', optionController.getAllOptionTypes);
router.get('/:id', optionController.getOptionById);
router.post('/', optionController.createOption);
router.put('/:id', optionController.updateOption);
router.delete('/:id', optionController.deleteOption);

module.exports = router;
