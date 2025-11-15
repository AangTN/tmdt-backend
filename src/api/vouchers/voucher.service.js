const repository = require('./voucher.repository');

function mapVoucherRow(v) {
  return {
    code: v.MaVoucher,
    MoTa: v.MoTa,
    LoaiGiamGia: v.LoaiGiamGia,
    GiaTri: v.GiaTri,
    DieuKienApDung: v.DieuKienApDung,
    NgayBatDau: v.NgayBatDau || null,
    NgayKetThuc: v.NgayKetThuc || null,
    SoLuong: v.SoLuong || null,
    TrangThai: v.TrangThai || null,
    usedCount: (v._count && typeof v._count.DonHang === 'number') ? v._count.DonHang : 0,
  };
}

async function getAllVouchers() {
  const rows = await repository.findAllVouchers();
  return rows.map(mapVoucherRow);
}

async function getVoucherByCode(code) {
  if (!code) return null;
  const v = await repository.findVoucherByCode(code);
  if (!v) return null;
  return mapVoucherRow(v);
}

async function createVoucher(payload) {
  if (!payload.code || !payload.code.trim()) {
    const e = new Error('Mã voucher là bắt buộc');
    e.status = 400;
    throw e;
  }
  if (!payload.MoTa || !payload.MoTa.trim()) {
    const e = new Error('Mô tả là bắt buộc');
    e.status = 400;
    throw e;
  }
  if (!payload.GiaTri || Number(payload.GiaTri) <= 0) {
    const e = new Error('Giá trị giảm phải lớn hơn 0');
    e.status = 400;
    throw e;
  }

  // Validate percentage must be between 0-100
  if (payload.LoaiGiamGia === 'PERCENT') {
    const giaTri = Number(payload.GiaTri);
    if (giaTri > 100) {
      const e = new Error('Phần trăm giảm phải từ 0-100');
      e.status = 400;
      throw e;
    }
  }

  // Validate amount max 100 million
  if (payload.LoaiGiamGia === 'AMOUNT') {
    const giaTri = Number(payload.GiaTri);
    if (giaTri > 100000000) {
      const e = new Error('Số tiền giảm tối đa 100 triệu');
      e.status = 400;
      throw e;
    }
  }

  if (!payload.SoLuong || Number(payload.SoLuong) <= 0) {
    const e = new Error('Số lượng phải lớn hơn 0');
    e.status = 400;
    throw e;
  }

  // Check if voucher code already exists
  const existing = await repository.findVoucherByCode(payload.code);
  if (existing) {
    const e = new Error('Mã voucher đã tồn tại');
    e.status = 400;
    throw e;
  }

  // Validate: end date must be after start date
  if (payload.NgayBatDau && payload.NgayKetThuc) {
    const startDate = new Date(payload.NgayBatDau);
    const endDate = new Date(payload.NgayKetThuc);
    if (endDate <= startDate) {
      const e = new Error('Ngày kết thúc phải sau ngày bắt đầu');
      e.status = 400;
      throw e;
    }
  }

  const created = await repository.createVoucher(payload);
  return mapVoucherRow(created);
}

async function updateVoucher(code, payload) {
  if (!code) {
    const e = new Error('Thiếu mã voucher');
    e.status = 400;
    throw e;
  }
  if (!payload.MoTa || !payload.MoTa.trim()) {
    const e = new Error('Mô tả là bắt buộc');
    e.status = 400;
    throw e;
  }
  if (!payload.GiaTri || Number(payload.GiaTri) <= 0) {
    const e = new Error('Giá trị giảm phải lớn hơn 0');
    e.status = 400;
    throw e;
  }

  // Validate percentage must be between 0-100
  if (payload.LoaiGiamGia === 'PERCENT') {
    const giaTri = Number(payload.GiaTri);
    if (giaTri > 100) {
      const e = new Error('Phần trăm giảm phải từ 0-100');
      e.status = 400;
      throw e;
    }
  }

  // Validate amount max 100 million
  if (payload.LoaiGiamGia === 'AMOUNT') {
    const giaTri = Number(payload.GiaTri);
    if (giaTri > 100000000) {
      const e = new Error('Số tiền giảm tối đa 100 triệu');
      e.status = 400;
      throw e;
    }
  }

  if (!payload.SoLuong || Number(payload.SoLuong) <= 0) {
    const e = new Error('Số lượng phải lớn hơn 0');
    e.status = 400;
    throw e;
  }

  const existing = await repository.findVoucherByCode(code);
  if (!existing) {
    const e = new Error('Voucher không tồn tại');
    e.status = 404;
    throw e;
  }

  // Validate: end date must be after start date
  if (payload.NgayBatDau && payload.NgayKetThuc) {
    const startDate = new Date(payload.NgayBatDau);
    const endDate = new Date(payload.NgayKetThuc);
    if (endDate <= startDate) {
      const e = new Error('Ngày kết thúc phải sau ngày bắt đầu');
      e.status = 400;
      throw e;
    }
  }

  const updated = await repository.updateVoucher(code, payload);
  return mapVoucherRow(updated);
}

async function toggleVoucherStatus(code, newStatus) {
  if (!code) {
    const e = new Error('Thiếu mã voucher');
    e.status = 400;
    throw e;
  }
  if (!newStatus || !['Active', 'Inactive'].includes(newStatus)) {
    const e = new Error('Trạng thái không hợp lệ');
    e.status = 400;
    throw e;
  }

  const existing = await repository.findVoucherByCode(code);
  if (!existing) {
    const e = new Error('Voucher không tồn tại');
    e.status = 404;
    throw e;
  }

  const updated = await repository.updateVoucherStatus(code, newStatus);
  return mapVoucherRow(updated);
}

module.exports = { getAllVouchers, getVoucherByCode, createVoucher, updateVoucher, toggleVoucherStatus };
