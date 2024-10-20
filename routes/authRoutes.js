const express = require('express');
const { signup, login, activateUser } = require('../controllers/authController');
const router = express.Router();

router.post('/signup', signup);
router.post('/activate', activateUser);
router.post('/login', login);

module.exports = router;
