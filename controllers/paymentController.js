// controllers/paymentController.js
const Razorpay = require('razorpay');
const Payment = require('../models/paymentModel'); // Adjust the path as necessary
const crypto = require('crypto');

// Function to save payment details
const savePayment = async (req, res) => {
    const { orderId, paymentId, amount, currency, status } = req.body;
    console.log('Received payment data:', req.body); // Log the received data for debugging
    const paymentData = {
        orderId,
        paymentId,
        amount,
        currency,
        status,
    };

    try {
        const payment = await Payment.create(paymentData);
        res.status(201).json(payment);
    } catch (error) {
        console.error('Error saving payment:', error); // Log the error for debugging
        res.status(500).json({ error: 'Error saving payment' });
    }
};

// const razorpayInstance = new Razorpay({
//     key_id: process.env.RAZORPAY_KEY_ID,
//     key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

// Function to verify payment
const verifyPayment = async (req, res) => {
    const { order_id, payment_id, signature } = req.body;
    console.log("1111", order_id, payment_id, signature, process.env.RAZORPAY_KEY_SECRET);

    const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    try {
        const generatedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(order_id + '|' + payment_id)
            .digest('hex');

        if (generatedSignature === signature) {
            const paymentDetails = await razorpay.payments.fetch(payment_id);
            const paymentMethod = paymentDetails.method; // This will give you the payment method

            let paid = await Payment.findOne({ order_id: order_id });
            paid.status = "paid";
            paid.signature = signature;
            paid.payment_id = payment_id;
            paid.attempts = paid.attempts + 1;
            paid.payment_method = paymentMethod; // Save the payment method
            paid.amount_paid = paymentDetails.amount;
            console.log("111111111111111000000000000", paid);
            await paid.save();

            // Payment is verified
            res.json({ status: 'success' });

        } else {
            // Payment verification failed
            res.status(400).json({ status: 'failure' });
        }
    } catch (error) {
        console.error('Error verifying payment:', error); // Log the error for debugging
        res.status(500).json({ error: 'Error verifying payment' });
    };
}

// const verifyPayment = async (req, res) => {
//     const { order_id, razorpay_payment_id, razorpay_signature, paymentMethod, paymentDetails } = req.body;
//     console.log("111111111111111000000000000", order_id, razorpay_payment_id, razorpay_signature, paymentMethod, paymentDetails);
//     const secret = 'QUGgAmSIpWCXBMEMkSHgMSE8'; // Your Razorpay secret key
//     const hmac = crypto.createHmac('sha256', secret);
//     hmac.update(order_id + '|' + razorpay_payment_id);
//     const generatedSignature = hmac.digest('hex');

//     if (generatedSignature === razorpay_signature) {
//         try {
//             // Find the payment by order ID
//             let paid = await paymentModel.findOne({ order_id: order_id });

//             if (!paid) {
//                 return res.status(404).json({ success: false, message: 'Payment record not found.' });
//             }
//             console.log("1112",paid);
//             // Update payment status and details
//             paid.status = "paid";
//             paid.signature = razorpay_signature;
//             paid.payment_id = razorpay_payment_id;
//             paid.attempts = (paid.attempts || 0) + 1; // Handle cases where attempts might be undefined
//             paid.payment_method = paymentMethod; // Save the payment method
//             paid.amount_paid = paymentDetails.amount; // Assuming paymentDetails has the amount paid

//             await paid.save(); // Save the updated payment record

//             return res.json({ success: true, message: 'Payment verified and updated successfully.' });
//         } catch (error) {
//             return res.status(500).json({ success: false, message: 'Server error', error: error.message });
//         }
//     } else {
//         return res.status(400).json({ success: false, message: 'Signature verification failed.' });
//     }
// };

module.exports = {
    savePayment,
    verifyPayment
};
