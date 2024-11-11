const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middlewares/authMiddleware');
const { createOrderAndProcessPayment } = require('../controllers/orderController');
const { savePayment, verifyPayment } = require('../controllers/paymentController');

router.post('/createOrder', isAuthenticated, createOrderAndProcessPayment)

router.post('/payments', savePayment);

router.post('/verify', verifyPayment)

module.exports = router;
