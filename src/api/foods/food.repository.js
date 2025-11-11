const prisma = require('../../client');

// Get list of foods (MonAn) with type and categories (no ratings payload)
const findAllFoods = async () => {
  return prisma.monAn.findMany({
    where: {
      TrangThai: 'Active',
    },
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

// Get top 8 best-selling foods based on delivered orders in last 7 days, always return 8 items
const findBestSellingFoods = async (limit = 8) => {
  // Query raw SQL to get sales data (món có bán + món chưa bán) in last 7 days
  const result = await prisma.$queryRaw`
    WITH delivered_orders AS (
      SELECT DISTINCT dh."MaDonHang"
      FROM "DonHang" dh
      JOIN "LichSuTrangThaiDonHang" lst ON lst."MaDonHang" = dh."MaDonHang"
      WHERE lst."TrangThai" = 'Đã giao'
        AND lst."ThoiGianCapNhat" >= NOW() - INTERVAL '7 days'
    ),
    regular_sales AS (
      SELECT 
        bt."MaMonAn",
        SUM(ctdh."SoLuong") as total_quantity
      FROM "ChiTietDonHang" ctdh
      JOIN "BienTheMonAn" bt ON bt."MaBienThe" = ctdh."MaBienThe"
      WHERE ctdh."MaDonHang" IN (SELECT "MaDonHang" FROM delivered_orders)
        AND (ctdh."Loai" = 'SP' OR ctdh."Loai" IS NULL)
      GROUP BY bt."MaMonAn"
    ),
    combo_sales AS (
      SELECT 
        bt."MaMonAn",
        SUM(ctdh."SoLuong" * ctcc."SoLuong") as total_quantity
      FROM "ChiTietDonHang" ctdh
      JOIN "ChiTietDonHang_ChiTietCombo" ctcc ON ctcc."MaChiTietDonHang" = ctdh."MaChiTiet"
      JOIN "BienTheMonAn" bt ON bt."MaBienThe" = ctcc."MaBienThe"
      WHERE ctdh."MaDonHang" IN (SELECT "MaDonHang" FROM delivered_orders)
        AND ctdh."Loai" = 'CB'
      GROUP BY bt."MaMonAn"
    ),
    total_sales AS (
      SELECT "MaMonAn", total_quantity FROM regular_sales
      UNION ALL
      SELECT "MaMonAn", total_quantity FROM combo_sales
    ),
    aggregated_sales AS (
      SELECT 
        "MaMonAn",
        SUM(total_quantity)::INTEGER as total_sold
      FROM total_sales
      GROUP BY "MaMonAn"
    )
    SELECT 
      ma."MaMonAn",
      COALESCE(s.total_sold, 0) as "totalSold"
    FROM "MonAn" ma
    LEFT JOIN aggregated_sales s ON s."MaMonAn" = ma."MaMonAn"
    WHERE ma."TrangThai" = 'Active'
    ORDER BY "totalSold" DESC, ma."MaMonAn" ASC
    LIMIT ${limit}
  `;
  
  // Fetch full food data with relations for the selected MaMonAn
  const foodIds = result.map(r => r.MaMonAn);
  
  const foods = await prisma.monAn.findMany({
    where: { MaMonAn: { in: foodIds } },
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
  });
  
  // Build map for quick lookup and preserve order
  const foodMap = new Map(foods.map(f => [f.MaMonAn, f]));
  const salesMap = new Map(result.map(r => [r.MaMonAn, r.totalSold]));
  
  return result.map(r => {
    const food = foodMap.get(r.MaMonAn);
    return {
      ...food,
      totalSold: salesMap.get(r.MaMonAn) || 0,
    };
  }).filter(Boolean);
};

// Get all featured foods (DeXuat = true and TrangThai = 'Active')
const findFeaturedFoods = async () => {
  return prisma.monAn.findMany({
    where: {
      DeXuat: true,
      TrangThai: 'Active',
    },
    select: {
      MaMonAn: true,
      TenMonAn: true,
      HinhAnh: true,
      MoTa: true,
      MaLoaiMonAn: true,
      DeXuat: true,
      TrangThai: true,
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

module.exports = { findAllFoods, findFoodById, findFoodsRatingStats, findBestSellingFoods, findFeaturedFoods };
