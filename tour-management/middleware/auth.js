// Middleware kiểm tra đăng nhập (JWT) và phân quyền
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
require('dotenv').config();

// Kiểm tra người dùng đã đăng nhập chưa (có token hợp lệ không)
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // dạng: "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: 'Bạn cần đăng nhập để thực hiện thao tác này.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Token không hợp lệ hoặc đã hết hạn.' });
    }
    req.user = decoded; // decoded = { id, email, role, full_name }
    next();
  });
}

// Chỉ Quản trị viên (phải gọi sau verifyToken)
function isAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Chỉ quản trị viên mới được thực hiện thao tác này.' });
  }
  next();
}

// Quản trị viên HOẶC Nhân viên (phải gọi sau verifyToken).
// Vai trò được đọc lại từ database (không chỉ tin vào token), nên khi một
// nhân viên bị xóa/hạ quyền thì quyền truy cập mất hiệu lực ngay.
async function isStaff(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT role FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0 || !['admin', 'staff'].includes(rows[0].role)) {
      return res.status(403).json({ message: 'Bạn không có quyền thực hiện thao tác này.' });
    }
    req.user.role = rows[0].role;
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi máy chủ khi kiểm tra quyền.' });
  }
}

module.exports = { verifyToken, isAdmin, isStaff };
