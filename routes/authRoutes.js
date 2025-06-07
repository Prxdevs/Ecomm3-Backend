const express = require('express');
const { signup, login, activateUser, updateUserRole, getSingleUser, logout, registerOrLogin, adminLogin } = require('../controllers/authController');
const { isAuthenticated } = require('../middlewares/authMiddleware');
const router = express.Router();

// Signup route
router.post('/signup', signup);

// Update User Route
router.put('/updateUserRole', updateUserRole);

// Actite User route
router.post('/activate', activateUser);

// Login route
router.post('/login', login);

// admin Login
router.post('/adminLogin', adminLogin);

// Logout route
router.post('/logout', logout);

// Get Single User route
router.post('/getSingleUser', isAuthenticated, getSingleUser);

//Google login/signup api
router.post('/registerOrLogin', registerOrLogin);

module.exports = router;
