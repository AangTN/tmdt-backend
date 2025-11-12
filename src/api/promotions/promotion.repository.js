const prisma = require('../../client');

// Lấy tất cả khuyến mãi
const findAllPromotions = async () => {
  return prisma.khuyenMai.findMany({
    include: {
      _count: {
        select: { MonAn_KhuyenMai: true },
      },
    },
    orderBy: { KMBatDau: 'desc' },
  });
};

// Lấy các món ăn đang được giảm giá (khuyến mãi active và trong thời gian)
const findDiscountedFoods = async () => {
  const now = new Date();
  
  return prisma.monAn_KhuyenMai.findMany({
    where: {
      KhuyenMai: {
        TrangThai: 'Active',
        KMBatDau: { lte: now },
        KMKetThuc: { gte: now },
      },
      MonAn: {
        TrangThai: 'Active',
      },
    },
    select: {
      MaMonAn: true,
      MaKhuyenMai: true,
    },
  });
};

module.exports = {
  findAllPromotions,
  findDiscountedFoods,
};
