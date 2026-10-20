const pool = require('../config/db');

// LẤY DANH SÁCH TẤT CẢ TOUR (có thể lọc theo từ khóa, điểm đến)
async function getAllTours(req, res) {
  try {
    const { keyword, destination, status } = req.query;
    let sql = `
      SELECT t.*, g.full_name AS guide_name
      FROM tours t
      LEFT JOIN guides g ON t.guide_id = g.id
      WHERE 1=1
    `;
    const params = [];

    if (keyword) {
      sql += ' AND (t.name LIKE ? OR t.destination LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }
    if (destination) {
      sql += ' AND t.destination LIKE ?';
      params.push(`%${destination}%`);
    }
    if (status) {
      sql += ' AND t.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY t.created_at DESC';

    const [tours] = await pool.query(sql, params);
    res.json(tours);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi máy chủ khi lấy danh sách tour.' });
  }
}

// LẤY CHI TIẾT 1 TOUR (kèm lịch trình + thông tin hướng dẫn viên)
async function getTourById(req, res) {
  try {
    const { id } = req.params;

    const [tours] = await pool.query(
      `SELECT t.*, g.full_name AS guide_name, g.phone AS guide_phone, g.bio AS guide_bio, g.image_url AS guide_image
       FROM tours t
       LEFT JOIN guides g ON t.guide_id = g.id
       WHERE t.id = ?`,
      [id]
    );

    if (tours.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy tour.' });
    }

    const [schedule] = await pool.query(
      'SELECT * FROM tour_schedule WHERE tour_id = ? ORDER BY day_number ASC',
      [id]
    );

    res.json({ ...tours[0], schedule });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi máy chủ khi lấy chi tiết tour.' });
  }
}

// TẠO TOUR MỚI (chỉ admin)
async function createTour(req, res) {
  try {
    const { name, destination, description, price, duration_days, max_people, start_date, image_url, guide_id, schedule } = req.body;

    if (!name || !destination || !price || !duration_days) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ tên tour, điểm đến, giá và số ngày.' });
    }

    const [result] = await pool.query(
      `INSERT INTO tours (name, destination, description, price, duration_days, max_people, start_date, image_url, guide_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, destination, description || '', price, duration_days, max_people || 20, start_date || null, image_url || null, guide_id || null]
    );

    const tourId = result.insertId;

    // Nếu có lịch trình kèm theo, lưu luôn
    if (Array.isArray(schedule) && schedule.length > 0) {
      for (const day of schedule) {
        await pool.query(
          'INSERT INTO tour_schedule (tour_id, day_number, title, description) VALUES (?, ?, ?, ?)',
          [tourId, day.day_number, day.title || '', day.description || '']
        );
      }
    }

    res.status(201).json({ message: 'Tạo tour thành công!', tourId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi máy chủ khi tạo tour.' });
  }
}

// CẬP NHẬT TOUR (chỉ admin)
async function updateTour(req, res) {
  try {
    const { id } = req.params;
    const { name, destination, description, price, duration_days, max_people, start_date, image_url, guide_id, status } = req.body;

    const [existing] = await pool.query('SELECT id FROM tours WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy tour để cập nhật.' });
    }

    await pool.query(
      `UPDATE tours SET name=?, destination=?, description=?, price=?, duration_days=?, max_people=?, start_date=?, image_url=?, guide_id=?, status=?
       WHERE id=?`,
      [name, destination, description, price, duration_days, max_people, start_date || null, image_url, guide_id || null, status || 'active', id]
    );

    res.json({ message: 'Cập nhật tour thành công!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật tour.' });
  }
}

// XÓA TOUR (chỉ admin)
async function deleteTour(req, res) {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM tours WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy tour để xóa.' });
    }

    res.json({ message: 'Xóa tour thành công!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi máy chủ khi xóa tour. Có thể tour này đang có người đặt.' });
  }
}

module.exports = { getAllTours, getTourById, createTour, updateTour, deleteTour };
