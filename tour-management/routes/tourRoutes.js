const express = require('express');
const router = express.Router();
const { getAllTours, getTourById, createTour, updateTour, deleteTour } = require('../controllers/tourController');
const { verifyToken, isStaff } = require('../middleware/auth');

// Ai cũng xem được danh sách và chi tiết tour
router.get('/', getAllTours);
router.get('/:id', getTourById);

// Nhân viên và Quản trị viên được thêm/sửa/xóa tour
router.post('/', verifyToken, isStaff, createTour);
router.put('/:id', verifyToken, isStaff, updateTour);
router.delete('/:id', verifyToken, isStaff, deleteTour);

module.exports = router;
