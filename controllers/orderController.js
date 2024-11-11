const Order = require('../models/orderModel'); // Adjust the path as needed

// Create a new order
// const createOrder = async (req, res) => {
//     try {
//         const user = req.user; // Get the user from the request
//         const { items, shippingInfo } = req.body; // Destructure items and shippingInfo from the request body

//         // Initialize totalAmount
//         let totalAmount = 0;

//         // Process each item to calculate totalPrice and update totalAmount
//         const processedItems = items.map(item => {
//             const totalPrice = item.priceAtAdd * item.quantity; // Calculate total price for the item
//             totalAmount += totalPrice; // Add to totalAmount

//             return {
//                 product: item.product, // Keep the product ID
//                 color: item.color, // Keep the color
//                 quantity: item.quantity, // Keep the quantity
//                 priceAtOrder: item.priceAtAdd, // Store the price at the time of order
//                 totalPrice: totalPrice // Store the calculated total price
//             };
//         });

//         const orderId = `ORD-${Date.now()}`; // Generate a unique order ID

//         // Create a new order instance
//         const newOrder = new Order({
//             user,
//             items: processedItems, // Use the processed items with totalPrice and priceAtOrder
//             shippingInfo,
//             totalAmount,
//             orderId
//         });

//         // Save the new order to the database
//         const savedOrder = await newOrder.save();
//         res.status(201).json({ success: true, order: savedOrder }); // Return the saved order
//     } catch (error) {
//         console.error("Error creating order:", error); // Log any errors
//         res.status(500).json({ success: false, message: "Server Error" }); // Send server error response
//     }
// };

const Razorpay = require("razorpay");
const jwt = require("jsonwebtoken");
// const { Order } = require("../models/orderModel");
const paymentModel = require("../models/paymentModel");
const customer = require("../models/userModel"); // Assuming customer model is defined
// const { createHash } = require("../utils/hashUtils"); // Your hashing utility

// function createHash(string) {
//     const hash = crypto.createHash("sha256"); // Ensure using the same algorithm
//     hash.update(string, "utf-8"); // Specify encoding explicitly (optional)
//     return hash.digest("hex"); // Return consistent digest format
// }

// exports.createOrderAndProcessPayment = async (req, res) => {
//     const {
//         amount,
//         currency,
//         receipt,
//         notes,
//         shippingInfo,
//         orderItems,
//     } = req.body;
//     console.log("1",req.body);
//     const customerid = req.user;
//     console.log("2",customerid);
//     // if (!amount || !currency || !receipt ) {
//     //     return res.status(400).json({ message: "Invalid request" });
//     // }

//     const razorpay = new Razorpay({
//         key_id: process.env.RAZORPAY_KEY_ID,
//         key_secret: process.env.RAZORPAY_KEY_SECRET,
//     });

//     // console.log("3",razorpay);

//     try {
//         const token = req.cookies.token;
//         console.log("4",token);
//         // const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         // const userId = decoded.id;

//         const user = await customer.findById(customerid);
//         console.log("5",user._id);

//         if (!user) {
//             return res.status(404).json({ message: "User not found" });
//         }

//         // let hashCustomerId = createHash(user._id);
//         // if (hashCustomerId !== customerid) {
//         //     return res.status(403).json({
//         //         success: false,
//         //         message: "You are not authorized to access this resource.",
//         //     });
//         // }

//         // Create Razorpay order
//         const order = await razorpay.orders.create({
//             amount: amount * 100, // Convert to smallest currency unit
//             currency,
//             receipt,
//             notes,
//         });
//         console.log("6",order);

//         // Save payment information in your database
//         const paymentEntry = await paymentModel.create({
//             customerid: user._id,
//             entity: order.entity,
//             amount: order.amount,
//             amount_paid: order.amount_paid,
//             amount_due: order.amount_due,
//             currency: order.currency,
//             receipt: order.receipt,
//             status: order.status,
//             attempts: order.attempts,
//             notes: order.notes,
//             created_at: order.created_at,
//             order_id: order.id,
//         });

//         console.log("7",paymentEntry);

//         // Calculate total order amount
//         let totalAmount = 0;
//         const processedItems = orderItems.map((item) => {
//             const totalPrice = item.priceAtAdd * item.quantity;
//             totalAmount += totalPrice;

//             return {
//                 product: item.product,
//                 color: item.color,
//                 quantity: item.quantity,
//                 priceAtOrder: item.priceAtAdd,
//                 totalPrice,
//             };
//         });
//         console.log("8",processedItems);

//         // Save order information in your database
//         const newOrder = new Order({
//             user: customerid,
//             items: processedItems,
//             shippingInfo,
//             totalAmount,
//             orderId: order.id,
//         });
//         console.log("9",newOrder);

//         const savedOrder = await newOrder.save();
//         console.log("10",savedOrder);

//         res.status(201).json({
//             success: true,
//             razorpayOrder: order,
//             savedOrder,
//             paymentEntry,
//         });
//     } catch (error) {
//         console.error("Error processing payment and creating order:", error);
//         res.status(500).json({ success: false, message: "Server Error" });
//     }
// };

exports.createOrderAndProcessPayment = async (req, res) => {
    const {
        amount,
        currency,
        receipt,
        notes,
        shippingInfo,
        items,
    } = req.body;
    // console.log("Request Body:", req.body);
    const customerid = req.user;
    // console.log("Customer ID:", customerid);

    const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    // console.log("Razorpay Initialized with Key ID:", razorpay);

    try {
        const user = await customer.findById(customerid);
        // console.log("Found User:", user);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // console.log("Creating Razorpay Order...");
        const order = await razorpay.orders.create({
            amount: amount * 100, // Convert to smallest currency unit
            currency,
            receipt: `receipt_${Date.now()}`, // Use a default receipt value
            notes,
        });
        // console.log("Razorpay Order Created:", order);


        const paymentEntry = await paymentModel.create({
            customerid: user._id,
            entity: order.entity,
            amount: order.amount,
            amount_paid: order.amount_paid,
            amount_due: order.amount_due,
            currency: order.currency,
            receipt: order.receipt,
            status: order.status,
            attempts: order.attempts,
            notes: order.notes,
            created_at: order.created_at || new Date(), // Default to current date if undefined
            order_id: order.id,
        });


        // Calculate total order amount
        let totalAmount = 0;
        // console.log("6...");
        const processedItems = items.map((item) => {
            const totalPrice = item.priceAtAdd * item.quantity;
            totalAmount += totalPrice;
            console.log("7...", totalAmount);
            return {
                product: item.product,
                color: item.color,
                quantity: item.quantity,
                priceAtOrder: item.priceAtAdd,
                totalPrice,
            };
        });

        // console.log("8  Processed Items:", processedItems);

        const newOrder = new Order({
            user: customerid,
            items: processedItems,
            shippingInfo,
            totalAmount,
            orderId: order.id,
        });
        // console.log("New Order Object:", newOrder);

        const savedOrder = await newOrder.save();
        // console.log("Order Saved:", savedOrder);

        res.status(201).json({
            success: true,
            razorpayOrder: order,
            savedOrder,
            paymentEntry,
        });
    } catch (error) {
        console.error("Error processing payment and creating order:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};



// module.exports = { createOrder };
