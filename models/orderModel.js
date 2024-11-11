const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    color: { type: String, required: true },
    quantity: { type: Number, required: true },
    priceAtOrder: { type: Number, required: true },
    totalPrice: { type: Number, required: true }
}, { _id: false }); // _id set to false to avoid generating sub-document IDs for order items

const OrderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [OrderItemSchema],
    shippingInfo: {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        address: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },

        // state: {
        //     type: String,
        //     required: true,
        // },
        pincode: {
            type: Number,
            required: true,
        },
        mobile: {
            type: Number,
            required: true,
        },
    },
    totalAmount: { type: Number, required: true },
    orderId: { type: String, unique: true }, // Internal order ID for your system
    paymentOrderId: { type: String, unique: true }, // Razorpay's order ID
    status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" }, // Order status
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Middleware to update `updatedAt` field on document modification
OrderSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Order', OrderSchema);
