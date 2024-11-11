// categoryModel.js
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    }, // e.g., "Clothing"
    description: {
        type: String,
        default: ''
    },
    image: {
        type: [String],
        required: true
    }, // Array for category images
});

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
