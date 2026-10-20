const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  cancelMyBooking,
  getAllBookings,
  updateBookingStatus,
} = require('../controllers/bookingController');
const { verifyToken, isStaff } = require('../middleware/auth');

// Khách hàng (cần đăng nhập)
router.post('/', verifyToken, createBooking);
router.get('/my-bookings', verifyToken, getMyBookings);
router.put('/:id/cancel', verifyToken, cancelMyBooking);

// Admin
router.get('/', verifyToken, isStaff, getAllBookings);
router.put('/:id/status', verifyToken, isStaff, updateBookingStatus);

module.exports = router;
