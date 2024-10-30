const express = require('express');
const router = express.Router();
const { addToCart, getCart, updateCartItem, removeCartItem } = require('../controllers/cartController');
const { isAuthenticated } = require('../middlewares/authMiddleware');

// Route to add item to cart
router.post('/add', addToCart);
// Route to get cart
router.get('/', getCart);
// Route to update cart item
router.put('/update', updateCartItem);
// Route to remove item from cart
router.post('/remove', removeCartItem);

module.exports = router;
