const express = require('express');
const router = express.Router();
const { listStaff, createStaff, updateStaff, deleteStaff } = require('../controllers/staffController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Toàn bộ chỉ dành cho Quản trị viên
router.get('/', verifyToken, isAdmin, listStaff);
router.post('/', verifyToken, isAdmin, createStaff);
router.put('/:id', verifyToken, isAdmin, updateStaff);
router.delete('/:id', verifyToken, isAdmin, deleteStaff);

module.exports = router;
