// QUẢN LÝ NGƯỜI DÙNG (khách hàng) — dành cho Nhân viên và Quản trị viên
const pool = require('../config/db');

// Danh sách khách hàng kèm số đơn đã đặt
async function listCustomers(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.full_name, u.email, u.phone, u.created_at,
              (SELECT COUNT(*) FROM bookings b WHERE b.user_id = u.id) AS total_bookings
       FROM users u
       WHERE u.role = 'customer'
       ORDER BY u.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi máy chủ khi lấy danh sách khách hàng.' });
  }
}

module.exports = { listCustomers };
