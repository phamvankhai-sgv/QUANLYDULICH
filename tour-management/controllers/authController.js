const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
require('dotenv').config();

// ĐĂNG KÝ TÀI KHOẢN MỚI (khách hàng)
async function register(req, res) {
  try {
    const { full_name, email, password, phone } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ họ tên, email và mật khẩu.' });
    }

    // Kiểm tra email đã tồn tại chưa
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email này đã được đăng ký.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO users (full_name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
      [full_name, email, hashedPassword, phone || null, 'customer']
    );

    res.status(201).json({ message: 'Đăng ký thành công! Vui lòng đăng nhập.', userId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi máy chủ khi đăng ký.' });
  }
}

// ĐĂNG NHẬP
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu.' });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng.' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, full_name: user.full_name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Đăng nhập thành công!',
      token,
      user: { id: user.id, full_name: user.full_name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi máy chủ khi đăng nhập.' });
  }
}

// XEM THÔNG TIN TÀI KHOẢN CỦA CHÍNH MÌNH
async function getMe(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT id, full_name, email, phone, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản.' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi máy chủ khi lấy thông tin tài khoản.' });
  }
}

// CẬP NHẬT HỌ TÊN, SỐ ĐIỆN THOẠI CỦA CHÍNH MÌNH
async function updateMe(req, res) {
  try {
    const { full_name, phone } = req.body;
    if (!full_name) {
      return res.status(400).json({ message: 'Vui lòng nhập họ tên.' });
    }
    await pool.query('UPDATE users SET full_name = ?, phone = ? WHERE id = ?', [full_name, phone || null, req.user.id]);
    res.json({ message: 'Cập nhật thông tin thành công!', full_name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật thông tin.' });
  }
}

// ĐỔI MẬT KHẨU (cần nhập đúng mật khẩu cũ)
async function changePassword(req, res) {
  try {
    const { old_password, new_password } = req.body;
    if (!old_password || !new_password) {
      return res.status(400).json({ message: 'Vui lòng nhập mật khẩu cũ và mật khẩu mới.' });
    }
    if (new_password.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
    }

    const [rows] = await pool.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản.' });
    }

    const ok = await bcrypt.compare(old_password, rows[0].password);
    if (!ok) {
      return res.status(400).json({ message: 'Mật khẩu cũ không đúng.' });
    }

    const hashed = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashed, req.user.id]);
    res.json({ message: 'Đổi mật khẩu thành công!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi máy chủ khi đổi mật khẩu.' });
  }
}

module.exports = { register, login, getMe, updateMe, changePassword };
