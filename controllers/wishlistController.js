
const Wishlist = require('../models/wishlistModel');
const Product = require('../models/productModel');

// Add an item to the wishlist
exports.addToWishlist = async (req, res) => {
    const { product, color, quantity } = req.body;
    const userId = req.user;
    try {
        // Check if the product exists
        const productData = await Product.findById(product);
        if (!productData) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Find or create the user's wishlist
        let wishlist = await Wishlist.findOne({ user: userId });
        if (!wishlist) {
            wishlist = new Wishlist({ user: userId, items: [] });
        }

        // Check if the item is already in the wishlist
        const existingItemIndex = wishlist.items.findIndex(item => item.product.equals(product) && item.color === color);
        if (existingItemIndex > -1) {
            // Item already exists, return a message indicating it is already in the wishlist
            return res.status(200).json({ message: 'This item is already in your wishlist' });
        } else {
            // New item, add it to the wishlist
            wishlist.items.push({
                product,
                color, // Make sure to include the color as well
                quantity: Number(quantity) // Ensure quantity is stored as a number
            });
        }

        await wishlist.save();
        res.status(200).json({ message: 'Item added to wishlist', wishlist });
    } catch (error) {
        res.status(500).json({ message: 'Error adding item to wishlist', error });
    }
};

exports.getWishlist = async (req, res) => {
    const userId = req.user; // Get user ID from authenticated user context

    try {
        const wishlist = await Wishlist.findOne({ user: userId }).populate('items.product');

        if (!wishlist) {
            console.log("No wishlist found for user ID:", userId); // Debugging log
            return res.status(404).json({ message: 'Wishlist not found' });
        }

        // Use Promise.all to fetch current prices concurrently
        const wishlistItems = await Promise.all(wishlist.items.map(async (item) => {
            const currentProduct = await Product.findById(item.product);
            const currentPrice = currentProduct.variants.find(v => v.color === item.color)?.price; // Fetch current price

            return {
                ...item.toObject(),
                currentPrice, // Add the current price to the item
            };
        }));

        res.status(200).json({ wishlistItems });
    } catch (error) {
        console.error("Error fetching wishlist:", error); // Log the error for debugging
        res.status(500).json({ message: 'Error fetching wishlist', error });
    }
};

// Update item quantity in the wishlist
exports.updateWishlistItem = async (req, res) => {
    const { productId, color, quantity } = req.body; // Get data from the request body
    const userId = req.user; // Access user ID from req.user

    try {
        const wishlist = await Wishlist.findOne({ user: userId });
        if (!wishlist) {
            return res.status(404).json({ message: 'Wishlist not found' });
        }

        const itemIndex = wishlist.items.findIndex(item => item.product.equals(productId) && item.color === color);
        if (itemIndex > -1) {
            if (quantity < 1) {
                // If quantity is less than 1, remove the item
                wishlist.items.splice(itemIndex, 1);
            } else {
                // Update the quantity
                wishlist.items[itemIndex].quantity = quantity;
            }
        } else {
            return res.status(404).json({ message: 'Item not found in wishlist' });
        }

        await wishlist.save();
        res.status(200).json({ message: 'Wishlist updated', wishlist });
    } catch (error) {
        res.status(500).json({ message: 'Error updating wishlist', error });
    }
};

// Remove item from the wishlist
exports.removeWishlistItem = async (req, res) => {
    const { productId } = req.body; // Get data from the request body
    const userId = req.user; // Access user ID from req.user
    try {
        const wishlist = await Wishlist.findOne({ user: userId });
        if (!wishlist) {
            return res.status(404).json({ message: 'Wishlist not found' });
        }

        const itemIndex = wishlist.items.findIndex(item => item.product.equals(productId));
        if (itemIndex > -1) {
            // Remove the item from the wishlist
            wishlist.items.splice(itemIndex, 1);
            await wishlist.save();
            res.status(200).json({ message: 'Item removed from wishlist', wishlist });
        } else {
            return res.status(404).json({ message: 'Item not found in wishlist' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error removing item from wishlist', error });
    }
};
