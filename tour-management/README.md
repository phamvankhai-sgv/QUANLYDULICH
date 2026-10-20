# VietTour — Website Quản lý Tour Du lịch

Đồ án môn học: Website quản lý & đặt tour du lịch.
Công nghệ: **Node.js + Express** (backend) · **MySQL** (cơ sở dữ liệu) · **HTML/CSS/JS thuần** (frontend).

## Chức năng chính

**Khách vãng lai / Khách hàng:**
- Xem trang chủ, danh sách tour, tìm kiếm/lọc tour theo tên hoặc điểm đến
- Xem chi tiết tour (mô tả, lịch trình từng ngày, hướng dẫn viên phụ trách)
- Đăng ký / đăng nhập tài khoản
- Đặt tour (chọn số lượng khách, ghi chú), xem tổng tiền tự động
- Xem lịch sử các tour đã đặt, hủy đơn đang chờ xác nhận

**Nhân viên (staff):**
- Đăng nhập vào khu quản trị (không được quản lý tài khoản nhân viên)
- Xem tổng quan, quản lý tour, hướng dẫn viên, xử lý đơn đặt tour
- Xem danh sách khách hàng (kèm số đơn đã đặt), có ô tìm kiếm
- Xem/sửa thông tin cá nhân, đổi mật khẩu

**Quản trị viên (Admin) — làm được mọi việc của nhân viên, và thêm:**
- Quản lý tài khoản nhân viên: thêm, sửa (đặt lại mật khẩu), xóa

**Quản trị viên (Admin):**
- Bảng điều khiển tổng quan (thống kê số tour, hướng dẫn viên, đơn đặt tour)
- Quản lý Tour: thêm / sửa / xóa tour, cấu hình lịch trình chi tiết từng ngày
- Quản lý Hướng dẫn viên: thêm / sửa / xóa
- Quản lý Đơn đặt tour: xem danh sách, lọc theo trạng thái, xác nhận hoặc hủy đơn

## Cấu trúc thư mục

```
tour-management/
├── config/db.js            # Kết nối MySQL
├── controllers/             # Xử lý logic nghiệp vụ
│   ├── authController.js
│   ├── tourController.js
│   ├── guideController.js
│   └── bookingController.js
├── routes/                  # Định tuyến API
├── middleware/auth.js       # Xác thực JWT + phân quyền admin
├── database/
│   ├── schema.sql            # Câu lệnh tạo database + dữ liệu mẫu
│   └── seed.js                # Script tạo tài khoản admin
├── public/                  # Toàn bộ giao diện (frontend)
│   ├── index.html, tours.html, tour-detail.html, ...
│   ├── admin/                 # Giao diện quản trị
│   ├── css/style.css
│   └── js/common.js
├── server.js                # File khởi động server
├── package.json
└── .env.example
```

## Hướng dẫn cài đặt và chạy

### Bước 1 — Cài đặt yêu cầu
- Cài [Node.js](https://nodejs.org) (bản 18 trở lên)
- Cài [MySQL](https://dev.mysql.com/downloads/) (hoặc dùng XAMPP/Laragon có sẵn MySQL)

### Bước 2 — Cài thư viện Node.js
Mở terminal tại thư mục dự án và chạy:
```bash
npm install
```

### Bước 3 — Tạo cơ sở dữ liệu
Mở MySQL (Workbench, phpMyAdmin, hoặc dòng lệnh) và chạy toàn bộ nội dung file `database/schema.sql`.
Lệnh này sẽ tự tạo database `tour_management`, các bảng, và một số tour/hướng dẫn viên mẫu.

Ví dụ bằng dòng lệnh:
```bash
mysql -u root -p < database/schema.sql
```

### Bước 4 — Cấu hình kết nối
Sao chép file `.env.example` thành `.env`, rồi điền thông tin MySQL của bạn:
```bash
cp .env.example .env
```
Mở file `.env` và sửa `DB_PASSWORD` (và các thông tin khác nếu cần) cho đúng với máy bạn.

### Bước 5 — Tạo tài khoản admin
Chạy lệnh sau (chỉ cần chạy 1 lần):
```bash
node database/seed.js
```
Sau khi chạy xong bạn sẽ có 2 tài khoản mẫu:
- Quản trị viên: `admin@tour.com` / `admin123`
- Nhân viên: `nhanvien@tour.com` / `nhanvien123`

> **Đã có database từ bản cũ (chưa có vai trò Nhân viên)?** Chạy thêm file `database/add_staff.sql` trên phpMyAdmin (tab SQL) trước khi chạy `node database/seed.js`.

### Bước 6 — Khởi động server
```bash
npm start
```
Hoặc nếu muốn tự động restart khi sửa code:
```bash
npm run dev
```

Mở trình duyệt tại: **http://localhost:3000**

## Ảnh trong website

- Dữ liệu mẫu (`database/schema.sql`) đã gán sẵn link ảnh minh họa theo điểm đến (Hạ Long, Đà Lạt, Phú Quốc, Sapa, Hội An) và ảnh đại diện tự tạo theo tên cho hướng dẫn viên — cần có kết nối internet khi mở trình duyệt để ảnh này hiển thị.
- Muốn đổi ảnh: vào **Admin → Quản lý Tour / Hướng dẫn viên → Sửa**, dán link ảnh mới vào ô "Link ảnh".
- Muốn dùng ảnh của riêng bạn (không phụ thuộc mạng): copy file ảnh vào thư mục `public/img/`, sau đó nhập đường dẫn dạng `/img/ten-file.jpg` vào ô "Link ảnh" (xem thêm `public/img/README.txt`).
- Nếu ảnh lỗi hoặc không tải được, giao diện sẽ tự động ẩn ảnh và hiện nền màu mặc định thay thế — không làm vỡ layout.

## Ghi chú khi bảo vệ đồ án

- Mật khẩu người dùng được mã hóa bằng **bcrypt**, không lưu dạng chữ thường (plain text).
- Đăng nhập dùng **JWT (JSON Web Token)**, token lưu ở `localStorage` phía trình duyệt.
- Phân quyền 3 vai trò (admin, staff, customer): `verifyToken` kiểm tra đăng nhập, `isStaff` cho phép nhân viên + quản trị viên (đọc lại vai trò từ database nên xóa nhân viên là mất quyền ngay), `isAdmin` chỉ dành riêng quản trị viên (quản lý nhân viên) — áp dụng ở tầng route, không chỉ ẩn/hiện giao diện.
- Database dùng khóa ngoại (FOREIGN KEY) để đảm bảo toàn vẹn dữ liệu: xóa hướng dẫn viên không xóa tour liên quan (`ON DELETE SET NULL`), xóa tour sẽ xóa lịch trình và đơn đặt liên quan (`ON DELETE CASCADE`).
- Có thể mở rộng thêm: thanh toán online, đánh giá/review tour, gửi email xác nhận, upload ảnh thật (hiện đang dùng ảnh minh họa bằng CSS gradient để không phụ thuộc dịch vụ lưu trữ ảnh ngoài).

## Nếu gặp lỗi

- **"Access denied for user"**: sai `DB_USER`/`DB_PASSWORD` trong file `.env`.
- **"connect ECONNREFUSED"**: MySQL chưa được khởi động.
- **Trang trắng / không tải được tour**: kiểm tra server có đang chạy (`npm start`) và mở Console trình duyệt (F12) xem lỗi cụ thể.
