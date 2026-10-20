const pool = require('../config/db');

// LẤY DANH SÁCH TẤT CẢ HƯỚNG DẪN VIÊN
async function getAllGuides(req, res) {
  try {
    const [guides] = await pool.query('SELECT * FROM guides ORDER BY created_at DESC');
    res.json(guides);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi máy chủ khi lấy danh sách hướng dẫn viên.' });
  }
}

// LẤY CHI TIẾT 1 HƯỚNG DẪN VIÊN
async function getGuideById(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM guides WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy hướng dẫn viên.' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi máy chủ.' });
  }
}

// THÊM HƯỚNG DẪN VIÊN MỚI (chỉ admin)
async function createGuide(req, res) {
  try {
    const { full_name, phone, email, experience_years, bio, image_url } = req.body;

    if (!full_name) {
      return res.status(400).json({ message: 'Vui lòng nhập tên hướng dẫn viên.' });
    }

    const [result] = await pool.query(
      'INSERT INTO guides (full_name, phone, email, experience_years, bio, image_url) VALUES (?, ?, ?, ?, ?, ?)',
      [full_name, phone || null, email || null, experience_years || 0, bio || '', image_url || null]
    );

    res.status(201).json({ message: 'Thêm hướng dẫn viên thành công!', guideId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi máy chủ khi thêm hướng dẫn viên.' });
  }
}

// CẬP NHẬT HƯỚNG DẪN VIÊN (chỉ admin)
async function updateGuide(req, res) {
  try {
    const { id } = req.params;
    const { full_name, phone, email, experience_years, bio, image_url } = req.body;

    const [result] = await pool.query(
      'UPDATE guides SET full_name=?, phone=?, email=?, experience_years=?, bio=?, image_url=? WHERE id=?',
      [full_name, phone, email, experience_years, bio, image_url, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy hướng dẫn viên để cập nhật.' });
    }

    res.json({ message: 'Cập nhật hướng dẫn viên thành công!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật.' });
  }
}

// XÓA HƯỚNG DẪN VIÊN (chỉ admin)
async function deleteGuide(req, res) {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM guides WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy hướng dẫn viên để xóa.' });
    }

    res.json({ message: 'Xóa hướng dẫn viên thành công!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi máy chủ khi xóa.' });
  }
}

module.exports = { getAllGuides, getGuideById, createGuide, updateGuide, deleteGuide };
