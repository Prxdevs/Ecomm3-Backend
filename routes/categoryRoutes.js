const express = require('express');
const {
    createCategory,
    getCategories,
    updateCategory,       // Add update function
    deleteCategory,       // Add delete function
    getCategoryById       // Add get by ID function
} = require('../controllers/categoryController');
const router = express.Router();

// Create a new category
router.post('/', createCategory);

// Get all categories
router.get('/', getCategories);

// Update a category by ID
router.put('/:id', updateCategory);

// Delete a category by ID
router.delete('/:id', deleteCategory);

module.exports = router;
