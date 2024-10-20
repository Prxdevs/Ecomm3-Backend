const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const randomstring = require('randomstring');
const ErrorHander = require('../utils/ErrorHander');
const catchAsyncErrors = require('../utils/catchAsyncErrors');

// exports.signup = async (req, res) => {
//     console.log("hello",req.body);
//     const { email, password } = req.body;
//     try {
//         const user = await User.create({ email, password });
//         res.status(201).json({ message: "User created successfully", user });
//     } catch (error) {
//         res.status(400).json({ error: error.message });
//     }
// };

function generateOTP(lengthChar) {
    return randomstring.generate({
        length: lengthChar, // You can adjust the OTP length as needed
        charset: 'numeric',
    });
}

exports.signup = async (req, res, next) => {
    const { username, email, password } = req.body;
    console.log("1");
    if (!email || !password || !username) {
        return next(new ErrorHander("Email and password are required", 400));
    }

    try {
        console.log("2");
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return next(new ErrorHander("User with this email already exists", 400));
        }

        const activationCode = generateOTP(6);
        console.log("3", activationCode);

        const newUser = await User.create({
            email,
            password,
            username,
            activationCode,
            activationCodeExpires: Date.now() + 3600000 // 1 hour expiry
        });
        console.log("4", newUser);

        const message = `
            <p>Hello,</p>
            <p>Please use the following code to activate your account:</p>
            <h3>${activationCode}</h3>
            <p>This code will expire in 1 hour.</p>
        `;

        await sendEmail({
            email: newUser.email,
            subject: 'Your Activation Code',
            message
        });

        res.status(201).json({ message: "User created successfully. OTP sent to email.", user: newUser });

    } catch (error) {
        console.log(error);
        return next(new ErrorHander("Error during signup", 400));
    }
};


// verify
exports.activateUser = catchAsyncErrors(async (req, res, next) => {
    const { email, activationCode } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        return next(new ErrorHander("User does not exist", 404)); // Use ErrorHander for consistent error handling
    }

    if (user.activationCode !== activationCode) {
        return res.status(400).json({ message: 'Invalid activation code' });
    }

    user.Isverified = true; // Or 1 if using numbers
    await user.save();

    return res.status(200).json({ message: 'Email verification successful' });
});

// exports.login = async (req, res) => {
//     const { email, password } = req.body;
//     try {
//         const user = await User.findOne({ email });
//         if (!user || !(await bcrypt.compare(password, user.password))) {
//             return res.status(400).json({ error: "Invalid email or password" });
//         }
//         const token = jwt.sign({ id: user._id }, 'your_jwt_secret');
//         res.status(200).json({ message: "Logged in successfully", token });
//     } catch (error) {
//         res.status(400).json({ error: error.message });
//     }
// };

exports.login = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        return next(new ErrorHander("Email and password are required", 400));
    }

    // Find user by email
    const user = await User.findOne({ email });

    // Check if user exists
    if (!user) {
        return next(new ErrorHander("Invalid email or password", 401));
    }

    // Check if user is verified
    if (!user.Isverified) {
        return next(new ErrorHander("Email not verified", 401));
    }

    // Check password
    const isPasswordMatch = await user.matchPassword(password);
    if (!isPasswordMatch) {
        return next(new ErrorHander("Invalid email or password", 401));
    }

    // Login successful, return user data (omit password)
    res.status(200).json({ message: "Login successful", user: { email: user.email, isVerified: user.Isverified } });
});