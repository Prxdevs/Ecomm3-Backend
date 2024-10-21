const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
    color: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true, min: 0 } // Ensure stock can't be negative
});

const productSchema = new mongoose.Schema({
    name: { type: String, required: true }, // e.g., "Shirt"
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    description: { type: String, default: '' },
    images: { type: [String], required: true }, // Array of image URLs
    variants: { type: [variantSchema], required: true }, // Array of variants
    featured: { type: Boolean, default: false } // Featured field
});

// Middleware to check stock before saving/updating
productSchema.pre('save', function(next) {
    // Validate that stock is not negative
    for (const variant of this.variants) {
        if (variant.stock < 0) {
            return next(new Error(`Stock for ${variant.color} cannot be negative`));
        }
    }
    next();
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;

