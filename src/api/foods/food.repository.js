const prisma = require('../../client');

// Get list of foods (MonAn) with type and categories (lightweight fields)
const findAllFoods = async () => {
  return prisma.monAn.findMany({
    select: {
      MaMonAn: true,
      TenMonAn: true,
      HinhAnh: true,
      MoTa: true,
      MaLoaiMonAn: true,
      LoaiMonAn: { select: { MaLoaiMonAn: true, TenLoaiMonAn: true } },
      MonAn_DanhMuc: {
        select: {
          DanhMuc: { select: { MaDanhMuc: true, TenDanhMuc: true } },
        },
      },
    },
    orderBy: { MaMonAn: 'asc' },
  });
};

// Detailed food by id with related variants, sizes, crusts, options
const findFoodById = async (id) => {
  return prisma.monAn.findUnique({
    where: { MaMonAn: Number(id) },
    include: {
      LoaiMonAn: true,
      MonAn_DanhMuc: { include: { DanhMuc: true } },
      BienTheMonAn: { include: { Size: true } },
      MonAn_DeBanh: { include: { DeBanh: true } },
      MonAn_TuyChon: {
        include: {
          TuyChon: {
            include: {
              LoaiTuyChon: true,
              TuyChon_Gia: { include: { Size: true } },
            },
          },
        },
      },
    },
  });
};

module.exports = { findAllFoods, findFoodById };
