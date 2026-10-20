const express = require('express');
const router = express.Router();
const { listCustomers } = require('../controllers/userController');
const { verifyToken, isStaff } = require('../middleware/auth');

// Nhân viên và Quản trị viên xem được danh sách khách hàng
router.get('/customers', verifyToken, isStaff, listCustomers);

module.exports = router;
