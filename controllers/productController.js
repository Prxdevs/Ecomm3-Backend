// productController.js
const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
const fs = require('fs');
const path = require('path');

// Create a new product
exports.createProduct = async (req, res) => {
    try {
        const { name, category, description, variants, featured } = req.body;

        // Check if the category exists
        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            return res.status(404).json({ message: 'Category not found' });
        }

        const directoryPath = path.join(__dirname, '../category', name);
        if (!fs.existsSync(directoryPath)) {
            fs.mkdirSync(directoryPath, { recursive: true });
        }

        // Map the uploaded files to their paths
        const imagesPath = req.files.map(file => `/products/${name}/${file.filename}`); // Use the same structure as in category

        // Create the new product with images
        const newProduct = new Product({
            name,
            category,
            description,
            images: imagesPath, // Save the image paths
            variants: JSON.parse(variants), // Assuming variants are sent as a JSON string
            featured: featured === 'true' // Convert to boolean
        });

        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
};

// Get all products
// exports.getAllProducts = async (req, res) => {
//     try {
//         const products = await Product.find().populate('category', 'name');
//         res.status(200).json(products);
//     } catch (error) {
//         console.error(error);
//         res.status(400).json({ message: error.message });
//     }
// };

exports.getAllProducts = async (req, res) => {
    const { category, color, tags } = req.query;

    try {
        let query = {};

        // Filter by category
        if (category) {
            // Find the category by name to get its ID
            const categoryDoc = await Category.findOne({ name: category });
            if (categoryDoc) {
                query.category = categoryDoc._id; // Set the query to filter by category ID
            } else {
                return res.status(404).json({ message: 'Category not found' });
            }
        }

        // Filter by color
        if (color) {
            const colorsArray = Array.isArray(color) ? color : [color]; // Ensure colors are in array format
            query['variants.color'] = { $in: colorsArray }; // Filter by any of the selected colors
        }

        // Filter by tag
        if (tags) {
            const tagsArray = Array.isArray(tags) ? tags : [tags]; // Ensure tags are in array format
            query['tags'] = { $in: tagsArray }; // Filter products that have any of the selected tags
        }

        const products = await Product.find(query).populate('category', 'name'); // Populate category names
        res.status(200).json(products);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
};



// Get a single product by ID
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('category', 'name');
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.status(200).json(product);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
};

// Update a product
exports.updateProduct = async (req, res) => {
    try {
        const { name, category, description, variants, featured } = req.body;

        // Check if the category exists
        if (category) {
            const categoryExists = await Category.findById(category);
            if (!categoryExists) {
                return res.status(404).json({ message: 'Category not found' });
            }
        }

        // Prepare the update object
        const updateData = {
            name,
            category,
            description,
            variants: JSON.parse(variants), // Assuming variants are sent as a JSON string
            featured: featured === 'true' // Convert to boolean
        };

        // Handle image uploads if there are any new files
        if (req.files && req.files.length > 0) {
            const imagesPath = req.files.map(file => `/product/${name}/${file.filename}`);
            updateData.images = imagesPath; // Update with new image paths
        }

        // Update the product with the new data
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });

        if (!updatedProduct) return res.status(404).json({ message: 'Product not found' });
        res.status(200).json(updatedProduct);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
};

