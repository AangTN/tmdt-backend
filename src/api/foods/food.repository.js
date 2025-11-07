const prisma = require('../../client');

// Get list of foods (MonAn) with type and categories (no ratings payload)
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

// Rating stats (avg & count) for all foods with visible reviews
const findFoodsRatingStats = async () => {
  return prisma.danhGiaMonAn.groupBy({
    by: ['MaMonAn'],
    where: { TrangThai: 'Hiển thị' },
    _avg: { SoSao: true },
    _count: { SoSao: true },
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
      // Include all visible reviews for details view
      DanhGiaMonAn: {
        where: { TrangThai: 'Hiển thị' },
        select: {
          MaDanhGiaMonAn: true,
          MaMonAn: true,
          MaTaiKhoan: true,
          SoSao: true,
          NoiDung: true,
          NgayDanhGia: true,
          TrangThai: true,
        },
        orderBy: { NgayDanhGia: 'desc' },
      },
    },
  });
};

module.exports = { findAllFoods, findFoodById, findFoodsRatingStats };
