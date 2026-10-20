// ==========================================================
// CÁC HÀM DÙNG CHUNG CHO TOÀN BỘ WEBSITE
// ==========================================================

const API_BASE = '/api';

// Gọi API kèm token đăng nhập (nếu có)
async function apiRequest(endpoint, method = 'GET', body = null) {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${API_BASE}${endpoint}`, options);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Có lỗi xảy ra, vui lòng thử lại.');
  }
  return data;
}

// Định dạng số tiền theo kiểu Việt Nam (vd: 3.500.000 ₫)
function formatMoney(num) {
  return Number(num).toLocaleString('vi-VN') + ' ₫';
}

// Định dạng ngày tháng kiểu Việt Nam
function formatDate(dateStr) {
  if (!dateStr) return 'Đang cập nhật';
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// Lấy thông tin người dùng đang đăng nhập (từ localStorage)
function getCurrentUser() {
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
}

function isLoggedIn() {
  return !!localStorage.getItem('token');
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/index.html';
}

// Cập nhật thanh điều hướng dựa theo trạng thái đăng nhập
function renderNavAuth() {
  const authEl = document.getElementById('nav-auth-guest');
  const menuEl = document.getElementById('user-menu');
  const greetingEl = document.getElementById('user-greeting');
  const adminLink = document.getElementById('nav-admin-link');
  const bookingsLink = document.getElementById('nav-bookings-link');

  const user = getCurrentUser();
  const isManager = user && (user.role === 'admin' || user.role === 'staff');

  if (user && menuEl) {
    if (authEl) authEl.style.display = 'none';
    menuEl.style.display = 'flex';
    if (greetingEl) greetingEl.textContent = `Xin chào, ${user.full_name}` + (isManager ? ` (${roleLabel(user.role)})` : '');
    if (adminLink) adminLink.style.display = isManager ? 'inline' : 'none';
    if (bookingsLink) bookingsLink.style.display = isManager ? 'none' : 'inline';
  } else if (authEl && menuEl) {
    authEl.style.display = 'flex';
    menuEl.style.display = 'none';
  }

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', logout);
}

// Bắt buộc phải đăng nhập mới xem được trang (dùng cho my-bookings.html)
function requireLogin() {
  if (!isLoggedIn()) {
    window.location.href = '/login.html';
  }
}

// Tên hiển thị của vai trò
function roleLabel(role) {
  return { admin: 'Quản trị viên', staff: 'Nhân viên', customer: 'Khách hàng' }[role] || role;
}

// Cho phép Quản trị viên HOẶC Nhân viên vào trang quản trị
function requireStaff() {
  const user = getCurrentUser();
  if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
    window.location.href = '/login.html';
  }
}

// Vẽ menu bên trái của khu vực quản trị (mục "Nhân viên" chỉ Quản trị viên mới thấy)
function renderAdminNav(activePath) {
  const user = getCurrentUser();
  const items = [
    ['/admin/dashboard.html', 'Tổng quan'],
    ['/admin/tours.html', 'Quản lý Tour'],
    ['/admin/guides.html', 'Hướng dẫn viên'],
    ['/admin/bookings.html', 'Đơn đặt tour'],
    ['/admin/customers.html', 'Khách hàng'],
  ];
  if (user && user.role === 'admin') items.push(['/admin/staff.html', 'Tài khoản nhân viên']);
  items.push(['/profile.html', 'Tài khoản của tôi'], ['/index.html', '← Về trang khách']);

  const ul = document.getElementById('admin-nav');
  if (!ul) return;
  ul.innerHTML = items
    .map(([href, label]) => `<li><a href="${href}" class="${href === activePath ? 'active' : ''}">${label}</a></li>`)
    .join('');
}

// Chỉ Quản trị viên mới xem được trang (dùng cho trang quản lý nhân viên)
function requireAdmin() {
  const user = getCurrentUser();
  if (!user || user.role !== 'admin') {
    window.location.href = '/login.html';
  }
}

function showAlert(el, message, type = 'error') {
  el.textContent = message;
  el.className = `alert show alert-${type}`;
}

document.addEventListener('DOMContentLoaded', renderNavAuth);
