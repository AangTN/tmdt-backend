const express = require('express');
const router = express.Router();
const typeController = require('./type.controller');

// Get all types
router.get('/', typeController.getTypes);

// Create new type
router.post('/', typeController.createType);

// Update type
router.put('/:id', typeController.updateType);

// Delete type
router.delete('/:id', typeController.deleteType);

module.exports = router;
