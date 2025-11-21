const bcrypt = require('bcrypt');
const repo = require('./auth.repository');

async function register({ email, hoTen, matKhau, soDienThoai }) {
  if (!email || !hoTen || !matKhau) {
    const e = new Error('Thiếu thông tin: email, hoTen, matKhau');
    e.status = 400;
    throw e;
  }

  // Check if email already exists
  const existing = await repo.findUserByEmail(email);
  if (existing) {
    const e = new Error('Email đã được sử dụng');
    e.status = 409;
    throw e;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(matKhau, 10);

  // Create user
  const { taiKhoan, nguoiDung } = await repo.createUser({
    email,
    hoTen,
    matKhau: hashedPassword,
    soDienThoai,
  });

  // Return user info without password
  return {
    maTaiKhoan: taiKhoan.MaTaiKhoan,
    email: taiKhoan.Email,
    role: taiKhoan.Role,
    maNguoiDung: nguoiDung.MaNguoiDung,
    hoTen: nguoiDung.HoTen,
    soDienThoai: nguoiDung.SoDienThoai,
    soNhaDuong: nguoiDung.SoNhaDuong,
    phuongXa: nguoiDung.PhuongXa,
    quanHuyen: nguoiDung.QuanHuyen,
    thanhPho: nguoiDung.ThanhPho,
  };
}

async function login({ email, matKhau }) {
  if (!email || !matKhau) {
    const e = new Error('Thiếu thông tin: email, matKhau');
    e.status = 400;
    throw e;
  }

  // Find user by email
  const user = await repo.findUserByEmail(email);
  if (!user) {
    const e = new Error('Email hoặc mật khẩu không đúng');
    e.status = 401;
    throw e;
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(matKhau, user.MatKhau);
  if (!isValidPassword) {
    const e = new Error('Email hoặc mật khẩu không đúng');
    e.status = 401;
    throw e;
  }

  // Return user info without password
  return {
    maTaiKhoan: user.MaTaiKhoan,
    email: user.Email,
    role: user.Role,
    maNguoiDung: user.NguoiDung?.MaNguoiDung,
    hoTen: user.NguoiDung?.HoTen,
    soDienThoai: user.NguoiDung?.SoDienThoai,
    soNhaDuong: user.NguoiDung?.SoNhaDuong,
    phuongXa: user.NguoiDung?.PhuongXa,
    quanHuyen: user.NguoiDung?.QuanHuyen,
    thanhPho: user.NguoiDung?.ThanhPho,
  };
}

async function adminLogin({ email, matKhau }) {
  if (!email || !matKhau) {
    const e = new Error('Thiếu thông tin: email, matKhau');
    e.status = 400;
    throw e;
  }

  // Find user by email
  const user = await repo.findUserByEmail(email);
  if (!user) {
    const e = new Error('Email hoặc mật khẩu không đúng');
    e.status = 401;
    throw e;
  }

  // Check if user is admin/shipper (not customer)
  const role = String(user.Role || '').toUpperCase();
  if (role === 'CUSTOMER') {
    const e = new Error('Tài khoản không có quyền truy cập hệ thống quản trị');
    e.status = 403;
    throw e;
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(matKhau, user.MatKhau);
  if (!isValidPassword) {
    const e = new Error('Email hoặc mật khẩu không đúng');
    e.status = 401;
    throw e;
  }

  // Build permissions based on role
  const permissions = getPermissionsByRole(role);

  // Return user info with permissions
  return {
    maTaiKhoan: user.MaTaiKhoan,
    maCoSo: user.NguoiDung?.MaCoSo || null,
    email: user.Email,
    role: user.Role,
    maNguoiDung: user.NguoiDung?.MaNguoiDung,
    hoTen: user.NguoiDung?.HoTen,
    soDienThoai: user.NguoiDung?.SoDienThoai,
    soNhaDuong: user.NguoiDung?.SoNhaDuong,
    phuongXa: user.NguoiDung?.PhuongXa,
    quanHuyen: user.NguoiDung?.QuanHuyen,
    thanhPho: user.NguoiDung?.ThanhPho,
    permissions,
  };
}

function getPermissionsByRole(role) {
  const roleUpper = String(role || '').toUpperCase();
  
  switch (roleUpper) {
    case 'SHIPPER':
      return ['Quản lý giao hàng'];
    
    case 'ADMIN':
      return [
        'Tổng quan chi nhánh',
        'Quản lý đơn hàng chi nhánh',
        'Quản lý đánh giá đơn hàng chi nhánh',
      ];
    
    case 'SUPER_ADMIN':
      return [
        'Tổng quan',
        'Quản lý sản phẩm',
        'Quản lý thể loại',
        'Quản lý danh mục',
        'Quản lý đơn hàng',
        'Quản lý người dùng',
        'Quản lý tùy chọn',
        'Quản lý đánh giá món ăn',
        'Quản lý đánh giá đơn hàng',
        'Quản lý khuyến mãi',
        'Quản lý voucher',
        'Quản lý banner',
        'Quản lý combo',
        'Quản lý quà tặng',
      ];
    
    default:
      return [];
  }
}

module.exports = {
  register,
  login,
  adminLogin,
};
