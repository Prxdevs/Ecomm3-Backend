// const mongoose = require('mongoose');

// const productSchema = new mongoose.Schema({
//     name: { type: String, required: true },
//     price: { type: Number, required: true },
//     category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
//     description: { type: String },
//     stock: { type: Number, default: 0 },
// });

// const Product = mongoose.model('Product', productSchema);
// module.exports = Product;

///////// SECOND LEVEL /////////

// const mongoose = require('mongoose');

// const productSchema = new mongoose.Schema({
//     name: { type: String, required: true }, // e.g., "Shirt"
//     price: { type: Number, required: true },
//     category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
//     description: { type: String, default: '' },
//     color: { type: [String], required: true }, // Array of available colors
//     sizes: { type: [String], required: true }, // Array of available sizes
//     stock: {
//         type: Map, // Using Map to manage stock per color
//         of: Map, // Each color will map to another Map of sizes
//         default: {} // Default to an empty map
//     },
//     featured: { type: Boolean, default: false }, // Featured field
// });

// // Middleware to check stock before saving/updating
// productSchema.pre('save', function(next) {
//     // Validate that stock is not negative
//     for (const [color, sizes] of this.stock) {
//         for (const [size, quantity] of sizes) {
//             if (quantity < 0) {
//                 return next(new Error(`Stock for ${color} - ${size} cannot be negative`));
//             }
//         }
//     }
//     next();
// });

// const Product = mongoose.model('Product', productSchema);
// module.exports = Product;

/////////////// FINAL LEVEL ///////////////

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

