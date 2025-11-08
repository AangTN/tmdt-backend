const repo = require('./user.repository');

async function getUserProfile(maNguoiDung) {
  if (!maNguoiDung) {
    const e = new Error('Thiếu MaNguoiDung');
    e.status = 400;
    throw e;
  }

  const user = await repo.findUserById(maNguoiDung);
  if (!user) {
    const e = new Error('Không tìm thấy người dùng');
    e.status = 404;
    throw e;
  }

  return user;
}

async function updateUserProfile(payload) {
  if (!payload) {
    const e = new Error('Thiếu dữ liệu cập nhật');
    e.status = 400;
    throw e;
  }

  const { MaNguoiDung, HoTen, SoDienThoai, SoNhaDuong, PhuongXa, QuanHuyen, ThanhPho } = payload;

  // Validate required fields
  if (!MaNguoiDung) {
    const e = new Error('Thiếu MaNguoiDung');
    e.status = 400;
    throw e;
  }

  if (!HoTen || String(HoTen).trim() === '') {
    const e = new Error('Họ tên không được để trống');
    e.status = 400;
    throw e;
  }

  if (!SoDienThoai || String(SoDienThoai).trim() === '') {
    const e = new Error('Số điện thoại không được để trống');
    e.status = 400;
    throw e;
  }

  // Validate phone format (basic Vietnamese phone number)
  const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
  if (!phoneRegex.test(String(SoDienThoai).trim())) {
    const e = new Error('Số điện thoại không hợp lệ');
    e.status = 400;
    throw e;
  }

  // Check if user exists
  const existingUser = await repo.findUserById(MaNguoiDung);
  if (!existingUser) {
    const e = new Error('Không tìm thấy người dùng');
    e.status = 404;
    throw e;
  }

  // Check if phone number is already used by another user
  if (SoDienThoai !== existingUser.SoDienThoai) {
    const phoneExists = await repo.checkPhoneExists(SoDienThoai, MaNguoiDung);
    if (phoneExists) {
      const e = new Error('Số điện thoại đã được sử dụng bởi tài khoản khác');
      e.status = 400;
      throw e;
    }
  }

  return repo.updateUser(MaNguoiDung, {
    hoTen: String(HoTen).trim(),
    soDienThoai: String(SoDienThoai).trim(),
    soNhaDuong: SoNhaDuong ? String(SoNhaDuong).trim() : null,
    phuongXa: PhuongXa ? String(PhuongXa).trim() : null,
    quanHuyen: QuanHuyen ? String(QuanHuyen).trim() : null,
    thanhPho: ThanhPho ? String(ThanhPho).trim() : null,
  });
}

module.exports = {
  getUserProfile,
  updateUserProfile,
};
