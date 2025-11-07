const prisma = require('../../client');

// Lấy toàn bộ combo Active (không load chi tiết nặng)
const findAllActiveCombos = async () => {
  return prisma.combo.findMany({
    where: { TrangThai: 'Active' },
    orderBy: { MaCombo: 'asc' },
    select: {
      MaCombo: true,
      TenCombo: true,
      HinhAnh: true,
      GiaCombo: true,
      MoTa: true,
      TrangThai: true,
      NgayTao: true,
      NgayCapNhat: true,
    },
  });
};

// Chi tiết combo theo id: bao gồm các món (BienTheMonAn + Size + MonAn), Đế bánh nếu có
const findComboById = async (id) => {
  return prisma.combo.findUnique({
    where: { MaCombo: Number(id) },
    include: {
      Combo_ChiTiet: {
        include: {
          BienTheMonAn: {
            include: {
              Size: true,
              MonAn: {
                select: { MaMonAn: true, TenMonAn: true, HinhAnh: true },
              },
            },
          },
          DeBanh: true,
        },
      },
      // Các đơn hàng liên quan không cần, bỏ qua để nhẹ
    },
  });
};

module.exports = { findAllActiveCombos, findComboById };