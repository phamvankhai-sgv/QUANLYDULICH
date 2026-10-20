// QUẢN LÝ TÀI KHOẢN NHÂN VIÊN (chỉ Quản trị viên)
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

// Danh sách nhân viên
async function listStaff(req, res) {
  try {
    const [rows] = await pool.query(
      "SELECT id, full_name, email, phone, created_at FROM users WHERE role = 'staff' ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi máy chủ khi lấy danh sách nhân viên.' });
  }
}

// Tạo tài khoản nhân viên
async function createStaff(req, res) {
  try {
    const { full_name, email, password, phone } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập họ tên, email và mật khẩu.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự.' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email này đã được sử dụng.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      "INSERT INTO users (full_name, email, password, phone, role) VALUES (?, ?, ?, ?, 'staff')",
      [full_name, email, hashed, phone || null]
    );

    res.status(201).json({ message: 'Tạo tài khoản nhân viên thành công!', staffId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi máy chủ khi tạo tài khoản nhân viên.' });
  }
}

// Cập nhật nhân viên (họ tên, SĐT; mật khẩu chỉ đổi khi có nhập)
async function updateStaff(req, res) {
  try {
    const { id } = req.params;
    const { full_name, phone, password } = req.body;

    if (!full_name) {
      return res.status(400).json({ message: 'Vui lòng nhập họ tên nhân viên.' });
    }

    const [rows] = await pool.query("SELECT id FROM users WHERE id = ? AND role = 'staff'", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy nhân viên.' });
    }

    await pool.query('UPDATE users SET full_name = ?, phone = ? WHERE id = ?', [full_name, phone || null, id]);

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
      }
      const hashed = await bcrypt.hash(password, 10);
      await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashed, id]);
    }

    res.json({ message: 'Cập nhật nhân viên thành công!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật nhân viên.' });
  }
}

// Xóa nhân viên
async function deleteStaff(req, res) {
  try {
    const { id } = req.params;
    const [result] = await pool.query("DELETE FROM users WHERE id = ? AND role = 'staff'", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy nhân viên để xóa.' });
    }
    res.json({ message: 'Đã xóa tài khoản nhân viên.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi máy chủ khi xóa nhân viên.' });
  }
}

module.exports = { listStaff, createStaff, updateStaff, deleteStaff };
