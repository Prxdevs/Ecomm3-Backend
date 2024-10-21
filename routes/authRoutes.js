const express = require('express');
const { signup, login, activateUser, updateUserRole } = require('../controllers/authController');
const router = express.Router();

router.post('/signup', signup);
router.put('/updateUserRole', updateUserRole);
router.post('/activate', activateUser);
router.post('/login', login);

module.exports = router;
