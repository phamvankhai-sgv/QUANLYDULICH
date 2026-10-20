// Script tạo tài khoản mẫu (chạy sau khi npm install và tạo database)
// Cách chạy: node database/seed.js
// Tạo: 1 Quản trị viên + 1 Nhân viên. Chạy lại nhiều lần vẫn an toàn (không tạo trùng).

require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

const accounts = [
  { full_name: 'Quản trị viên', email: 'admin@tour.com', password: 'admin123', phone: '0900000000', role: 'admin' },
  { full_name: 'Nhân viên mẫu', email: 'nhanvien@tour.com', password: 'nhanvien123', phone: '0911111111', role: 'staff' },
];

async function seed() {
  try {
    for (const a of accounts) {
      const [rows] = await pool.query('SELECT id FROM users WHERE email = ?', [a.email]);
      if (rows.length > 0) {
        console.log(`- ${a.email} đã tồn tại, bỏ qua.`);
        continue;
      }
      const hashed = await bcrypt.hash(a.password, 10);
      await pool.query(
        'INSERT INTO users (full_name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
        [a.full_name, a.email, hashed, a.phone, a.role]
      );
      console.log(`✅ Đã tạo ${a.role === 'admin' ? 'Quản trị viên' : 'Nhân viên'}: ${a.email} / ${a.password}`);
    }
  } catch (err) {
    console.error('Lỗi khi tạo tài khoản mẫu:', err.message);
    if (err.message.includes('Data truncated')) {
      console.error('=> Database chưa có vai trò staff. Hãy chạy file database/add_staff.sql trên phpMyAdmin trước.');
    }
  } finally {
    pool.end();
  }
}

seed();
