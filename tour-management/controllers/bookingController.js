const pool = require('../config/db');

// KHÁCH HÀNG ĐẶT TOUR MỚI
async function createBooking(req, res) {
  try {
    const userId = req.user.id; // lấy từ token đã xác thực
    const { tour_id, num_people, note } = req.body;

    if (!tour_id || !num_people || num_people < 1) {
      return res.status(400).json({ message: 'Vui lòng chọn tour và nhập số lượng người hợp lệ.' });
    }

    // Lấy giá tour để tính tổng tiền
    const [tours] = await pool.query('SELECT price, max_people FROM tours WHERE id = ?', [tour_id]);
    if (tours.length === 0) {
      return res.status(404).json({ message: 'Tour không tồn tại.' });
    }

    const totalPrice = tours[0].price * num_people;

    const [result] = await pool.query(
      'INSERT INTO bookings (user_id, tour_id, num_people, total_price, note) VALUES (?, ?, ?, ?, ?)',
      [userId, tour_id, num_people, totalPrice, note || '']
    );

    res.status(201).json({ message: 'Đặt tour thành công! Vui lòng chờ xác nhận.', bookingId: result.insertId, totalPrice });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi máy chủ khi đặt tour.' });
  }
}

// KHÁCH HÀNG XEM CÁC TOUR MÌNH ĐÃ ĐẶT
async function getMyBookings(req, res) {
  try {
    const userId = req.user.id;
    const [bookings] = await pool.query(
      `SELECT b.*, t.name AS tour_name, t.destination, t.image_url, t.start_date
       FROM bookings b
       JOIN tours t ON b.tour_id = t.id
       WHERE b.user_id = ?
       ORDER BY b.created_at DESC`,
      [userId]
    );
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi máy chủ khi lấy lịch sử đặt tour.' });
  }
}

// KHÁCH HÀNG HỦY ĐƠN ĐẶT TOUR CỦA MÌNH (chỉ khi đang pending)
async function cancelMyBooking(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const [rows] = await pool.query('SELECT * FROM bookings WHERE id = ? AND user_id = ?', [id, userId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy đơn đặt tour.' });
    }
    if (rows[0].status !== 'pending') {
      return res.status(400).json({ message: 'Chỉ có thể hủy đơn đang chờ xác nhận.' });
    }

    await pool.query('UPDATE bookings SET status = "cancelled" WHERE id = ?', [id]);
    res.json({ message: 'Đã hủy đơn đặt tour.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi máy chủ khi hủy đơn.' });
  }
}

// ADMIN: LẤY TẤT CẢ ĐƠN ĐẶT TOUR
async function getAllBookings(req, res) {
  try {
    const [bookings] = await pool.query(
      `SELECT b.*, t.name AS tour_name, u.full_name AS customer_name, u.email AS customer_email, u.phone AS customer_phone
       FROM bookings b
       JOIN tours t ON b.tour_id = t.id
       JOIN users u ON b.user_id = u.id
       ORDER BY b.created_at DESC`
    );
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi máy chủ khi lấy danh sách đơn đặt tour.' });
  }
}

// ADMIN: CẬP NHẬT TRẠNG THÁI ĐƠN (xác nhận / hủy)
async function updateBookingStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ.' });
    }

    const [result] = await pool.query('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy đơn đặt tour.' });
    }

    res.json({ message: 'Cập nhật trạng thái thành công!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật trạng thái.' });
  }
}

module.exports = { createBooking, getMyBookings, cancelMyBooking, getAllBookings, updateBookingStatus };
