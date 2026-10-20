const express = require('express');
const router = express.Router();
const { register, login, getMe, updateMe, changePassword } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);

// Tài khoản cá nhân (mọi vai trò đã đăng nhập)
router.get('/me', verifyToken, getMe);
router.put('/me', verifyToken, updateMe);
router.put('/change-password', verifyToken, changePassword);

module.exports = router;
