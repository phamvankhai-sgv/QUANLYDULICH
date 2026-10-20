-- ============================================================
-- NÂNG CẤP DATABASE ĐANG CÓ: THÊM VAI TRÒ NHÂN VIÊN (staff)
-- Chỉ cần chạy file này nếu bạn ĐÃ có database tour_management từ bản cũ.
-- (Nếu tạo mới bằng schema.sql bản mới thì KHÔNG cần chạy file này.)
-- Cách chạy: phpMyAdmin -> tab SQL -> dán nội dung -> Go
-- ============================================================
USE tour_management;

ALTER TABLE users
  MODIFY role ENUM('admin', 'staff', 'customer') NOT NULL DEFAULT 'customer';
