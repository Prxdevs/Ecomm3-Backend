// productController.js
const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
const fs = require('fs');
const path = require('path');

// Create a new product
exports.createProduct = async (req, res) => {
    try {
        const { name, category, description, variants, tags, featured } = req.body;
        console.log('get data from frontend', name, category, description, variants, featured);
        // Check if the category exists
        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            return res.status(404).json({ message: 'Category not found' });
        }

        const directoryPath = path.join(__dirname, '../category', name);
        if (!fs.existsSync(directoryPath)) {
            fs.mkdirSync(directoryPath, { recursive: true });
        }

        // const { category } = req.body;
        // if (!category || !mongoose.Types.ObjectId.isValid(category)) {
        //     return res.status(400).json({ message: 'Invalid Category ID' });
        // }


        // Map the uploaded files to their paths
        // const imagesPath = req.files.map(file => `/products/${name}/${file.filename}`); // Use the same structure as in category
        let imagesPath = [];
        if (req.files && req.files.length > 0) {
            imagesPath = req.files.map(file => `/products/${name}/${file.filename}`);
        }

        // Create the new product with images
        const newProduct = new Product({
            name,
            category,
            description,
            tags,
            images: imagesPath, // Save the image paths
            variants: JSON.parse(variants), // Assuming variants are sent as a JSON string
            featured: featured === 'true' // Convert to boolean
        });

        console.log('newProduct', newProduct);

        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
};

// Get all products

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

// exports.updateProduct = async (req, res) => {
//     try {
//         const { name, category, description, tags, variants, existingImages, removedImages, featured } = req.body;

//         // Check if the category exists
//         if (category) {
//             const categoryExists = await Category.findById(category);
//             if (!categoryExists) {
//                 return res.status(404).json({ message: 'Category not found' });
//             }
//         }

//         // Parse arrays from JSON strings if necessary
//         const parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
//         const parsedVariants = typeof variants === 'string' ? JSON.parse(variants) : variants;
//         const parsedExistingImages = typeof existingImages === 'string' ? JSON.parse(existingImages) : existingImages;
//         const parsedRemovedImages = typeof removedImages === 'string' ? JSON.parse(removedImages) : removedImages;

//         // Prepare the update data
//         const updateData = {
//             name,
//             category,
//             description,
//             tags: parsedTags,
//             variants: parsedVariants,
//             featured: featured === 'true',
//         };

//         // Retrieve existing product images
//         const existingProduct = await Product.findById(req.params.id);
//         if (!existingProduct) return res.status(404).json({ message: 'Product not found' });

//         // Remove specified images if any
//         if (parsedRemovedImages && parsedRemovedImages.length > 0) {
//             updateData.images = existingProduct.images.filter(image => !parsedRemovedImages.includes(image));
//         } else {
//             updateData.images = parsedExistingImages || existingProduct.images;
//         }

//         // Handle new image uploads
//         if (req.files && req.files.length > 0) {
//             const newImagesPath = req.files.map(file => `/products/${name}/${file.filename}`);
//             updateData.images = [...updateData.images, ...newImagesPath];
//         }

//         // Update the product in the database
//         const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });

//         res.status(200).json(updatedProduct);
//     } catch (error) {
//         console.error(error);
//         res.status(400).json({ message: error.message });
//     }
// };

exports.updateProduct = async (req, res) => {
    try {
        const { name, category, description, tags, variants, existingImages, removedImages, featured } = req.body;

        // Check if the category exists
        if (category) {
            const categoryExists = await Category.findById(category);
            if (!categoryExists) {
                return res.status(404).json({ message: 'Category not found' });
            }
        }

        // Parse arrays from JSON strings if necessary
        const parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
        const parsedVariants = typeof variants === 'string' ? JSON.parse(variants) : variants;
        const parsedExistingImages = typeof existingImages === 'string' ? JSON.parse(existingImages) : existingImages;
        const parsedRemovedImages = typeof removedImages === 'string' ? JSON.parse(removedImages) : removedImages;

        // Prepare the update data
        const updateData = {
            name,
            category,
            description,
            tags: parsedTags,
            variants: parsedVariants,
            featured: featured === 'true',
        };

        // Retrieve existing product images
        const existingProduct = await Product.findById(req.params.id);
        if (!existingProduct) return res.status(404).json({ message: 'Product not found' });

        // Remove specified images if any
        if (parsedRemovedImages && parsedRemovedImages.length > 0) {
            updateData.images = existingProduct.images.filter(image => !parsedRemovedImages.includes(image));

            // Delete removed images from the backend folder
            parsedRemovedImages.forEach((image) => {
                const imagePath = path.join(__dirname, '../uploads', image); // Update this path
                console.log(`Checking image: ${imagePath}`);
                fs.access(imagePath, fs.constants.F_OK, (err) => {
                    if (!err) {
                        fs.unlink(imagePath, (unlinkErr) => {
                            if (unlinkErr) console.error(`Error deleting image: ${unlinkErr.message}`);
                        });
                    } else {
                        console.error(`Image not found: ${imagePath}`);
                    }
                });
            });
        } else {
            updateData.images = parsedExistingImages || existingProduct.images;
        }

        // Handle new image uploads
        if (req.files && req.files.length > 0) {
            const newImagesPath = req.files.map(file => `/products/${name}/${file.filename}`);
            updateData.images = [...updateData.images, ...newImagesPath];
        }

        // Update the product in the database
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });

        res.status(200).json(updatedProduct);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
};


// Delete a product
exports.deleteProduct = async (req, res) => {
    try {
        Console.log('req.params.id', req.params.id);
        // const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
};

