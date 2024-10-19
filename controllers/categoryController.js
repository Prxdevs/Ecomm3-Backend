// categoryController.js
const Category = require('../models/categoryModel');
const fs = require('fs');
const path = require('path');

// Create a new category
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Check if the category already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: 'Category with this name already exists.' });
    }

    // Create the directory if it doesn't exist
    const directoryPath = path.join(__dirname, '../category', name);
    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath, { recursive: true });
    }

    // Map the uploaded files to their paths
    const imagePath = req.files.map(file => `/category/${name}/${file.filename}`);

    const newCategory = new Category({
      name,
      description,
      image: imagePath // Save the filename instead of the buffer
    });

    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a category
exports.updateCategory = async (req, res) => {
  try {
    const updatedData = { ...req.body }; // Prepare data to update
    if (req.files) {
      updatedData.image = req.files.map(file => `/category/${req.body.name}/${file.filename}`);
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true, runValidators: true }
    );

    if (!updatedCategory) return res.status(404).json({ message: 'Category not found' });
    res.status(200).json(updatedCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a category
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    // Delete the associated images from the filesystem
    if (Array.isArray(category.image)) {
      category.image.forEach(imagePath => {
        const fullPath = path.join(__dirname, '../', imagePath);
        fs.unlinkSync(fullPath);
      });
    }

    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
