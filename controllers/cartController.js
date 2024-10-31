
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');

// Add an item to the cart
exports.addToCart = async (req, res) => {
    const { product, color, quantity } = req.body;
    const userId = req.user;
    try {
        // Check if the product exists
        const productData = await Product.findById(product);
        if (!productData) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Find or create the user's cart
        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = new Cart({ user: userId, items: [] });
        }

        // Check if the item is already in the cart
        const existingItemIndex = cart.items.findIndex(item => item.product.equals(product) && item.color === color);
        if (existingItemIndex > -1) {
            // Item already exists, update the quantity
            cart.items[existingItemIndex].quantity = Number(cart.items[existingItemIndex].quantity) + Number(quantity);
        } else {
            // New item, add it to the cart
            cart.items.push({
                product,
                color,
                quantity: Number(quantity),
                priceAtAdd: productData.variants.find(v => v.color === color).price,
            });
        }

        await cart.save();
        res.status(200).json({ message: 'Item added to cart', cart });
    } catch (error) {
        res.status(500).json({ message: 'Error adding item to cart', error });
    }
};

exports.getCart = async (req, res) => {
    const userId = req.user; // Get user ID from authenticated user context

    try {
        const cart = await Cart.findOne({ user: userId }).populate('items.product');

        if (!cart) {
            console.log("No cart found for user ID:", userId); // Debugging log
            return res.status(404).json({ message: 'Cart not found' });
        }

        // Use Promise.all to fetch current prices concurrently
        const cartItems = await Promise.all(cart.items.map(async (item) => {
            const currentProduct = await Product.findById(item.product);
            const currentPrice = currentProduct.variants.find(v => v.color === item.color)?.price; // Fetch current price

            return {
                ...item.toObject(),
                currentPrice, // Add the current price to the item
            };
        }));

        res.status(200).json({ cartItems });
    } catch (error) {
        console.error("Error fetching cart:", error); // Log the error for debugging
        res.status(500).json({ message: 'Error fetching cart', error });
    }
};

// Update item quantity in the cart
exports.updateCartItem = async (req, res) => {
    const { productId, color, quantity } = req.body; // Get data from the request body
    const userId = req.user; // Access user ID from req.user

    try {
        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const itemIndex = cart.items.findIndex(item => item.product.equals(productId) && item.color === color);
        if (itemIndex > -1) {
            if (quantity < 1) {
                // If quantity is less than 1, remove the item
                cart.items.splice(itemIndex, 1);
            } else {
                // Update the quantity
                cart.items[itemIndex].quantity = quantity;
            }
        } else {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        await cart.save();
        res.status(200).json({ message: 'Cart updated', cart });
    } catch (error) {
        res.status(500).json({ message: 'Error updating cart', error });
    }
};

// Remove item from the cart
exports.removeCartItem = async (req, res) => {
    const { productId, color } = req.body; // Get data from the request body
    const userId = req.user; // Access user ID from req.user
    try {
        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const itemIndex = cart.items.findIndex(item => item.product.equals(productId) && item.color === color);
        if (itemIndex > -1) {
            // Remove the item from the cart
            cart.items.splice(itemIndex, 1);
            await cart.save();
            res.status(200).json({ message: 'Item removed from cart', cart });
        } else {
            return res.status(404).json({ message: 'Item not found in cart' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error removing item from cart', error });
    }
};

// Calculate total amount in the cart
exports.getCartTotal = async (req, res) => {
    try {
        const userId = req.user;
        const cart = await Cart.findOne({ user: userId, status: 'active' });
        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        // Calculate total
        const totalAmount = cart.items.reduce((total, item) => {
            return total + item.priceAtAdd * item.quantity;
        }, 0);

        res.json({ total: totalAmount });
    } catch (error) {
        console.error('Error calculating cart total:', error);
        res.status(500).json({ error: 'Server error' });
    }
};