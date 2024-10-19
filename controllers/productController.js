// second level

// const Category = require('../models/categoryModel');
// const Product = require('../models/productModel'); // Assuming you have a Product model

// // Create a new product

// exports.createProduct = async (req, res) => {
//     try {
//       // Check if the category exists
//       const category = await Category.findById(req.body.categoryId);
//       if (!category) {
//         return res.status(400).json({ message: 'Invalid category ID' });
//       }
  
//       const product = new Product(req.body);
//       await product.save();
//       res.status(201).json(product);
//     } catch (error) {
//       res.status(400).json({ message: error.message });
//     }
//   };

// // Get all products
// exports.getAllProducts = async (req, res) => {
//   try {
//     const products = await Product.find();
//     res.status(200).json(products);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Get a product by ID
// exports.getProductById = async (req, res) => {
//   try {
//     const product = await Product.findById(req.params.id);
//     if (!product) return res.status(404).json({ message: 'Product not found' });
//     res.status(200).json(product);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Update a product
// exports.updateProduct = async (req, res) => {
//   try {
//     const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     if (!product) return res.status(404).json({ message: 'Product not found' });
//     res.status(200).json(product);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

// // Delete a product
// exports.deleteProduct = async (req, res) => {
//   try {
//     const product = await Product.findByIdAndDelete(req.params.id);
//     if (!product) return res.status(404).json({ message: 'Product not found' });
//     res.status(200).json({ message: 'Product deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Get featured products
// exports.getFeaturedProducts = async (req, res) => {
//   try {
//     const products = await Product.find({ featured: true });
//     res.status(200).json(products);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };


// second level

// const Category = require('../models/categoryModel');
// const Product = require('../models/productModel');

// // Create a new product
// exports.createProduct = async (req, res) => {
//     try {
//         // Check if the category exists
//         const category = await Category.findById(req.body.category);
//         if (!category) {
//             return res.status(404).json({ message: 'Category not found' });
//         }

//         // If category exists, create the new product
//         const newProduct = new Product(req.body);
//         await newProduct.save();
//         res.status(201).json(newProduct);
//     } catch (error) {
//         res.status(400).json({ message: error.message });
//     }
// };

// // Get all products
// exports.getAllProducts = async (req, res) => {
//     try {
//         const products = await Product.find().populate('category', 'name');
//         res.status(200).json(products);
//     } catch (error) {
//         res.status(400).json({ message: error.message });
//     }
// };

// // Get a single product by ID
// exports.getProductById = async (req, res) => {
//     try {
//         const product = await Product.findById(req.params.id).populate('category', 'name');
//         if (!product) return res.status(404).json({ message: 'Product not found' });
//         res.status(200).json(product);
//     } catch (error) {
//         res.status(400).json({ message: error.message });
//     }
// };

// // Update a product
// exports.updateProduct = async (req, res) => {
//     try {
//         const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
//         if (!product) return res.status(404).json({ message: 'Product not found' });
//         res.status(200).json(product);
//     } catch (error) {
//         res.status(400).json({ message: error.message });
//     }
// };

// // Delete a product
// exports.deleteProduct = async (req, res) => {
//     try {
//         const product = await Product.findByIdAndDelete(req.params.id);
//         if (!product) return res.status(404).json({ message: 'Product not found' });
//         res.status(200).json({ message: 'Product deleted successfully' });
//     } catch (error) {
//         res.status(400).json({ message: error.message });
//     }
// };


const Category = require('../models/categoryModel');
const Product = require('../models/productModel');

// Create a new product
exports.createProduct = async (req, res) => {
    try {
        // Check if the category exists
        const category = await Category.findById(req.body.category);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // If category exists, create the new product
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all products
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().populate('category', 'name');
        res.status(200).json(products);
    } catch (error) {
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
        res.status(400).json({ message: error.message });
    }
};

// Update a product
exports.updateProduct = async (req, res) => {
    try {
        // Ensure the incoming request contains the correct structure
        const { name, category, description, images, variants, featured } = req.body;

        // Check if the category exists
        if (category) {
            const categoryExists = await Category.findById(category);
            if (!categoryExists) {
                return res.status(404).json({ message: 'Category not found' });
            }
        }

        // Update the product with the new data
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { name, category, description, images, variants, featured },
            { new: true, runValidators: true } // runValidators ensures that the variant schema is validated
        );

        if (!updatedProduct) return res.status(404).json({ message: 'Product not found' });
        res.status(200).json(updatedProduct);
    } catch (error) {
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
        res.status(400).json({ message: error.message });
    }
};
