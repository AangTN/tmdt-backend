const express = require('express');
const router = express.Router();
const categoryController = require('./category.controller');

// Get all categories
router.get('/', categoryController.getCategories);

// Create new category
router.post('/', categoryController.createCategory);

// Update category
router.put('/:id', categoryController.updateCategory);

// Delete category
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
