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

module.exports = {
  register,
  login,
};
