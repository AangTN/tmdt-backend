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

module.exports = { getAllVouchers, getVoucherByCode };
