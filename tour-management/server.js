require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const tourRoutes = require('./routes/tourRoutes');
const guideRoutes = require('./routes/guideRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const staffRoutes = require('./routes/staffRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json()); // đọc dữ liệu JSON từ request body

// Phục vụ file tĩnh (HTML/CSS/JS) trong thư mục public
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/tours', tourRoutes);
app.use('/api/guides', guideRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/users', userRoutes);

// Route mặc định trả về trang chủ
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});
