-- ============================================
-- CSDL QUẢN LÝ TOUR DU LỊCH
-- Chạy toàn bộ file này trong MySQL để tạo database + bảng + dữ liệu mẫu
-- ============================================

CREATE DATABASE IF NOT EXISTS tour_management
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tour_management;

-- ---------- BẢNG NGƯỜI DÙNG ----------
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role ENUM('admin', 'staff', 'customer') NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------- BẢNG HƯỚNG DẪN VIÊN ----------
CREATE TABLE IF NOT EXISTS guides (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(100),
  experience_years INT DEFAULT 0,
  bio TEXT,
  image_url VARCHAR(255) DEFAULT '/img/guide-default.jpg',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------- BẢNG TOUR ----------
CREATE TABLE IF NOT EXISTS tours (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  destination VARCHAR(150) NOT NULL,
  description TEXT,
  price DECIMAL(12,2) NOT NULL,
  duration_days INT NOT NULL DEFAULT 1,
  max_people INT NOT NULL DEFAULT 20,
  start_date DATE,
  image_url VARCHAR(255) DEFAULT '/img/tour-default.jpg',
  guide_id INT,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (guide_id) REFERENCES guides(id) ON DELETE SET NULL
);

-- ---------- BẢNG LỊCH TRÌNH CHI TIẾT CỦA TOUR ----------
CREATE TABLE IF NOT EXISTS tour_schedule (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tour_id INT NOT NULL,
  day_number INT NOT NULL,
  title VARCHAR(200),
  description TEXT,
  FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE
);

-- ---------- BẢNG ĐẶT TOUR ----------
CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  tour_id INT NOT NULL,
  num_people INT NOT NULL DEFAULT 1,
  total_price DECIMAL(12,2) NOT NULL,
  status ENUM('pending', 'confirmed', 'cancelled') NOT NULL DEFAULT 'pending',
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE
);

-- ============================================
-- DỮ LIỆU MẪU
-- ============================================
-- LƯU Ý: Tài khoản admin KHÔNG được tạo ở đây vì mật khẩu cần được mã hóa (bcrypt).
-- Sau khi cài đặt xong (npm install), hãy chạy lệnh:   node database/seed.js
-- Lệnh này sẽ tự tạo 2 tài khoản mẫu:
--   Quản trị viên: admin@tour.com    / admin123
--   Nhân viên:     nhanvien@tour.com / nhanvien123

-- Hướng dẫn viên mẫu
-- (image_url dùng dịch vụ tạo ảnh đại diện theo tên, không vi phạm bản quyền, bạn có thể thay bằng ảnh thật sau)
INSERT INTO guides (full_name, phone, email, experience_years, bio, image_url) VALUES
('Nguyễn Văn An', '0912345678', 'an.nguyen@tour.com', 5, 'Hướng dẫn viên chuyên tuyến miền Bắc, am hiểu văn hóa vùng cao.', 'https://ui-avatars.com/api/?name=Nguyen+Van+An&background=0F5C56&color=fff&size=256'),
('Trần Thị Bích', '0987654321', 'bich.tran@tour.com', 3, 'Chuyên tour biển đảo, năng động và nhiệt tình.', 'https://ui-avatars.com/api/?name=Tran+Thi+Bich&background=E29B3F&color=fff&size=256'),
('Lê Hoàng Nam', '0977111222', 'nam.le@tour.com', 8, 'Hơn 8 năm kinh nghiệm dẫn tour quốc tế và trong nước.', 'https://ui-avatars.com/api/?name=Le+Hoang+Nam&background=0A403B&color=fff&size=256');

-- Tour mẫu
-- (image_url dùng ảnh minh họa theo từ khóa điểm đến, bạn có thể thay bằng ảnh thật của công ty sau)
INSERT INTO tours (name, destination, description, price, duration_days, max_people, start_date, image_url, guide_id) VALUES
('Khám phá Vịnh Hạ Long', 'Quảng Ninh', 'Hành trình 3 ngày 2 đêm khám phá vẻ đẹp kỳ vĩ của Vịnh Hạ Long, tham quan hang động, chèo kayak và thưởng thức hải sản tươi ngon.', 3500000, 3, 25, '2026-11-15', 'https://picsum.photos/seed/halong/800/500', 1),
('Đà Lạt mộng mơ', 'Lâm Đồng', 'Tour 4 ngày 3 đêm tham quan thành phố ngàn hoa, các địa danh nổi tiếng như Thung lũng Tình yêu, Hồ Xuân Hương, chợ đêm Đà Lạt.', 2900000, 4, 30, '2026-11-20', 'https://picsum.photos/seed/dalat/800/500', 2),
('Phú Quốc biển xanh', 'Kiên Giang', 'Nghỉ dưỡng 5 ngày 4 đêm tại đảo ngọc Phú Quốc, tắm biển, lặn ngắm san hô và thưởng thức đặc sản biển.', 6500000, 5, 20, '2026-12-01', 'https://picsum.photos/seed/phuquoc/800/500', 2),
('Sapa - Mùa lúa chín', 'Lào Cai', 'Tour trekking 3 ngày 2 đêm chinh phục Fansipan, ngắm ruộng bậc thang và tìm hiểu văn hóa dân tộc thiểu số.', 3200000, 3, 15, '2026-11-25', 'https://picsum.photos/seed/sapa/800/500', 1),
('Hội An - Đà Nẵng - Huế', 'Miền Trung', 'Hành trình 5 ngày 4 đêm khám phá 3 di sản văn hóa miền Trung: phố cổ Hội An, thành phố biển Đà Nẵng, cố đô Huế.', 5800000, 5, 25, '2026-12-10', 'https://picsum.photos/seed/hoian/800/500', 3);

-- Lịch trình mẫu cho Tour Hạ Long (tour_id = 1)
INSERT INTO tour_schedule (tour_id, day_number, title, description) VALUES
(1, 1, 'Hà Nội - Hạ Long - Du thuyền', 'Khởi hành từ Hà Nội, lên du thuyền tham quan Vịnh, ăn tối và ngủ đêm trên du thuyền.'),
(1, 2, 'Hang Sửng Sốt - Đảo Titop', 'Tham quan hang Sửng Sốt, chèo kayak, tắm biển tại đảo Titop.'),
(1, 3, 'Làng chài Cửa Vạn - Về Hà Nội', 'Tham quan làng chài, mua sắm đặc sản và trở về Hà Nội.');

-- Lịch trình mẫu cho Tour Đà Lạt (tour_id = 2)
INSERT INTO tour_schedule (tour_id, day_number, title, description) VALUES
(2, 1, 'Khởi hành - Check-in Đà Lạt', 'Di chuyển đến Đà Lạt, nhận phòng khách sạn, dạo chợ đêm.'),
(2, 2, 'Thung lũng Tình yêu - Đồi chè Cầu Đất', 'Tham quan các điểm du lịch nổi tiếng, chụp ảnh check-in.'),
(2, 3, 'Thiền viện Trúc Lâm - Hồ Tuyền Lâm', 'Tham quan thiền viện, đi cáp treo, dạo hồ.'),
(2, 4, 'Tự do khám phá - Về lại điểm xuất phát', 'Buổi sáng tự do mua sắm đặc sản, chiều khởi hành về.');
