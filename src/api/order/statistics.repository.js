const prisma = require('../../client');

/**
 * Thống kê sản phẩm bán chạy nhất (không bao gồm combo)
 * @param {Object} options - { limit, branchId, startDate, endDate }
 */
async function getBestSellingProducts(options = {}) {
  const { limit = 10, branchId, startDate, endDate } = options;
  
  // Build where condition for orders first
  const orderWhere = {};
  if (branchId) orderWhere.MaCoSo = Number(branchId);
  if (startDate || endDate) {
    orderWhere.NgayDat = {};
    if (startDate) orderWhere.NgayDat.gte = new Date(startDate);
    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setDate(endDateTime.getDate() + 1);
      orderWhere.NgayDat.lt = endDateTime;
    }
  }

  // Get order IDs that match the filter
  const orders = await prisma.donHang.findMany({
    where: orderWhere,
    select: { MaDonHang: true },
  });
  
  const orderIds = orders.map(o => o.MaDonHang);
  
  if (orderIds.length === 0) {
    return [];
  }

  const result = await prisma.chiTietDonHang.groupBy({
    by: ['MaBienThe'],
    where: {
      Loai: 'SP', // Chỉ lấy sản phẩm, không lấy combo
      MaDonHang: { in: orderIds },
    },
    _sum: {
      SoLuong: true,
      ThanhTien: true,
    },
    _count: {
      MaChiTiet: true,
    },
    orderBy: {
      _sum: {
        SoLuong: 'desc',
      },
    },
    take: limit,
  });

  // Lấy thông tin chi tiết sản phẩm
  const detailedResults = await Promise.all(
    result.map(async (item) => {
      const variant = await prisma.bienTheMonAn.findUnique({
        where: { MaBienThe: item.MaBienThe },
        include: {
          MonAn: {
            include: {
              MonAn_DanhMuc: {
                include: {
                  DanhMuc: true,
                },
              },
            },
          },
          Size: true,
        },
      });

      return {
        MaBienThe: item.MaBienThe,
        TongSoLuongBan: item._sum.SoLuong || 0,
        TongDoanhThu: item._sum.ThanhTien || 0,
        SoDonHang: item._count.MaChiTiet || 0,
        ThongTinSanPham: variant,
      };
    })
  );

  return detailedResults;
}

/**
 * Thống kê combo bán chạy nhất
 * @param {Object} options - { limit, branchId, startDate, endDate }
 */
async function getBestSellingCombos(options = {}) {
  const { limit = 10, branchId, startDate, endDate } = options;
  
  // Build where condition for orders
  const orderWhere = {};
  if (branchId) orderWhere.MaCoSo = Number(branchId);
  if (startDate || endDate) {
    orderWhere.NgayDat = {};
    if (startDate) orderWhere.NgayDat.gte = new Date(startDate);
    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setDate(endDateTime.getDate() + 1);
      orderWhere.NgayDat.lt = endDateTime;
    }
  }

  // Get order IDs that match the filter
  const orders = await prisma.donHang.findMany({
    where: orderWhere,
    select: { MaDonHang: true },
  });
  
  const orderIds = orders.map(o => o.MaDonHang);
  
  if (orderIds.length === 0) {
    return [];
  }

  const result = await prisma.chiTietDonHang.groupBy({
    by: ['MaCombo'],
    where: {
      Loai: 'CB',
      MaCombo: { not: null },
      MaDonHang: { in: orderIds },
    },
    _sum: {
      SoLuong: true,
      ThanhTien: true,
    },
    _count: {
      MaChiTiet: true,
    },
    orderBy: {
      _sum: {
        SoLuong: 'desc',
      },
    },
    take: limit,
  });

  const detailedResults = await Promise.all(
    result.map(async (item) => {
      const combo = await prisma.combo.findUnique({
        where: { MaCombo: item.MaCombo },
        select: {
          MaCombo: true,
          TenCombo: true,
          MoTa: true,
          HinhAnh: true,
          GiaCombo: true,
          TrangThai: true,
        },
      });

      return {
        MaCombo: item.MaCombo,
        TongSoLuongBan: item._sum.SoLuong || 0,
        TongDoanhThu: item._sum.ThanhTien || 0,
        SoDonHang: item._count.MaChiTiet || 0,
        ThongTinCombo: combo,
      };
    })
  );

  return detailedResults;
}

/**
 * Thống kê doanh thu theo cơ sở
 * @param {Object} options - { startDate, endDate }
 */
async function getRevenueByBranch(options = {}) {
  const { startDate, endDate } = options;
  
  const whereCondition = {};
  if (startDate || endDate) {
    whereCondition.NgayDat = {};
    if (startDate) whereCondition.NgayDat.gte = new Date(startDate);
    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setDate(endDateTime.getDate() + 1);
      whereCondition.NgayDat.lt = endDateTime;
    }
  }

  const result = await prisma.donHang.groupBy({
    by: ['MaCoSo'],
    where: whereCondition,
    _sum: {
      TongTien: true,
      TienGiamGia: true,
      PhiShip: true,
    },
    _count: {
      MaDonHang: true,
    },
    orderBy: {
      _sum: {
        TongTien: 'desc',
      },
    },
  });

  // Lấy thông tin chi tiết cơ sở
  const detailedResults = await Promise.all(
    result.map(async (item) => {
      const branch = await prisma.coSo.findUnique({
        where: { MaCoSo: item.MaCoSo },
        select: {
          MaCoSo: true,
          TenCoSo: true,
          SoDienThoai: true,
          SoNhaDuong: true,
          PhuongXa: true,
          QuanHuyen: true,
          ThanhPho: true,
        },
      });

      return {
        MaCoSo: item.MaCoSo,
        TongDoanhThu: item._sum.TongTien || 0,
        TongGiamGia: item._sum.TienGiamGia || 0,
        TongPhiShip: item._sum.PhiShip || 0,
        SoDonHang: item._count.MaDonHang || 0,
        DoanhThuThucTe: (item._sum.TongTien || 0) - (item._sum.TienGiamGia || 0),
        ThongTinCoSo: branch,
      };
    })
  );

  return detailedResults;
}

/**
 * Thống kê tổng quan doanh thu
 * @param {Object} options - { startDate, endDate, branchId }
 */
async function getOverallRevenue(options = {}) {
  const { startDate, endDate, branchId } = options;
  
  const whereCondition = {};
  if (branchId) whereCondition.MaCoSo = Number(branchId);
  if (startDate || endDate) {
    whereCondition.NgayDat = {};
    if (startDate) whereCondition.NgayDat.gte = new Date(startDate);
    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setDate(endDateTime.getDate() + 1);
      whereCondition.NgayDat.lt = endDateTime;
    }
  }

  const result = await prisma.donHang.aggregate({
    where: whereCondition,
    _sum: {
      TongTien: true,
      TienTruocGiamGia: true,
      TienGiamGia: true,
      PhiShip: true,
    },
    _count: {
      MaDonHang: true,
    },
    _avg: {
      TongTien: true,
    },
  });

  return {
    TongDoanhThu: result._sum.TongTien || 0,
    TongTienHang: result._sum.TienTruocGiamGia || 0,
    TongGiamGia: result._sum.TienGiamGia || 0,
    TongPhiShip: result._sum.PhiShip || 0,
    SoDonHang: result._count.MaDonHang || 0,
    GiaTriTrungBinh: result._avg.TongTien || 0,
    DoanhThuThucTe: (result._sum.TongTien || 0) - (result._sum.TienGiamGia || 0),
  };
}

/**
 * Thống kê số lượng đơn hàng theo khoảng thời gian
 * @param {Object} options - { startDate, endDate, branchId, groupBy }
 */
async function getOrderCountByPeriod(options = {}) {
  const { startDate, endDate, branchId, groupBy = 'day' } = options;
  
  const whereCondition = {};
  if (branchId) whereCondition.MaCoSo = Number(branchId);
  if (startDate || endDate) {
    whereCondition.NgayDat = {};
    if (startDate) whereCondition.NgayDat.gte = new Date(startDate);
    if (endDate) {
      // Thêm 1 ngày để bao gồm toàn bộ ngày endDate
      const endDateTime = new Date(endDate);
      endDateTime.setDate(endDateTime.getDate() + 1);
      whereCondition.NgayDat.lt = endDateTime;
    }
  }

  // Lấy tất cả đơn hàng trong khoảng thời gian
  const orders = await prisma.donHang.findMany({
    where: whereCondition,
    select: {
      MaDonHang: true,
      NgayDat: true,
      TongTien: true,
      MaCoSo: true,
    },
    orderBy: { NgayDat: 'asc' },
  });

  // Nhóm theo ngày/tuần/tháng
  // Database lưu giờ VN nhưng JS đọc như UTC, nên dùng getUTC* để lấy giá trị đúng
  const grouped = {};
  orders.forEach(order => {
    const date = new Date(order.NgayDat);
    let key;
    
    if (groupBy === 'day') {
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const day = String(date.getUTCDate()).padStart(2, '0');
      key = `${year}-${month}-${day}`;
    } else if (groupBy === 'week') {
      const weekStart = new Date(date);
      weekStart.setUTCDate(date.getUTCDate() - date.getUTCDay());
      const year = weekStart.getUTCFullYear();
      const month = String(weekStart.getUTCMonth() + 1).padStart(2, '0');
      const day = String(weekStart.getUTCDate()).padStart(2, '0');
      key = `${year}-${month}-${day}`;
    } else if (groupBy === 'month') {
      key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`; // YYYY-MM
    } else if (groupBy === 'year') {
      key = String(date.getUTCFullYear());
    }

    if (!grouped[key]) {
      grouped[key] = {
        period: key,
        count: 0,
        totalRevenue: 0,
      };
    }
    
    grouped[key].count += 1;
    grouped[key].totalRevenue += Number(order.TongTien) || 0;
  });

  return Object.values(grouped).sort((a, b) => a.period.localeCompare(b.period));
}

/**
 * Thống kê theo trạng thái đơn hàng
 * @param {Object} options - { startDate, endDate, branchId }
 */
async function getOrdersByStatus(options = {}) {
  const { startDate, endDate, branchId } = options;
  
  const whereCondition = {};
  if (branchId) whereCondition.MaCoSo = Number(branchId);
  if (startDate || endDate) {
    whereCondition.NgayDat = {};
    if (startDate) whereCondition.NgayDat.gte = new Date(startDate);
    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setDate(endDateTime.getDate() + 1);
      whereCondition.NgayDat.lt = endDateTime;
    }
  }

  // Lấy tất cả đơn hàng với trạng thái mới nhất
  const orders = await prisma.donHang.findMany({
    where: whereCondition,
    select: {
      MaDonHang: true,
      TongTien: true,
      LichSuTrangThaiDonHang: {
        orderBy: { ThoiGianCapNhat: 'desc' },
        take: 1,
        select: { TrangThai: true },
      },
    },
  });

  // Nhóm theo trạng thái
  const statusGroups = {};
  orders.forEach(order => {
    const status = order.LichSuTrangThaiDonHang[0]?.TrangThai || 'Không rõ';
    if (!statusGroups[status]) {
      statusGroups[status] = {
        TrangThai: status,
        SoDonHang: 0,
        TongDoanhThu: 0,
      };
    }
    statusGroups[status].SoDonHang += 1;
    statusGroups[status].TongDoanhThu += Number(order.TongTien) || 0;
  });

  return Object.values(statusGroups).sort((a, b) => b.SoDonHang - a.SoDonHang);
}

/**
 * Thống kê theo phương thức thanh toán
 * @param {Object} options - { startDate, endDate, branchId }
 */
async function getOrdersByPaymentMethod(options = {}) {
  const { startDate, endDate, branchId } = options;
  
  // Build where condition for orders
  const orderWhere = {};
  if (branchId) orderWhere.MaCoSo = Number(branchId);
  if (startDate || endDate) {
    orderWhere.NgayDat = {};
    if (startDate) orderWhere.NgayDat.gte = new Date(startDate);
    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setDate(endDateTime.getDate() + 1);
      orderWhere.NgayDat.lt = endDateTime;
    }
  }

  // Get order IDs that match the filter
  const orders = await prisma.donHang.findMany({
    where: orderWhere,
    select: { MaDonHang: true },
  });
  
  const orderIds = orders.map(o => o.MaDonHang);
  
  if (orderIds.length === 0) {
    return [];
  }

  const result = await prisma.thanhToan.groupBy({
    by: ['PhuongThuc'],
    where: {
      MaDonHang: { in: orderIds },
      PhuongThuc: { in: ['Tiền Mặt', 'Chuyển Khoản'] },
    },
    _sum: {
      SoTien: true,
    },
    _count: {
      MaThanhToan: true,
    },
  });

  return result.map(item => ({
    PhuongThuc: item.PhuongThuc,
    SoGiaoDich: item._count.MaThanhToan || 0,
    TongTien: item._sum.SoTien || 0,
  }));
}

/**
 * So sánh doanh thu giữa các cơ sở theo thời gian
 * @param {Object} options - { startDate, endDate, groupBy }
 */
async function getRevenueComparisonByBranch(options = {}) {
  const { startDate, endDate, groupBy = 'day' } = options;
  
  const whereCondition = {};
  if (startDate || endDate) {
    whereCondition.NgayDat = {};
    if (startDate) whereCondition.NgayDat.gte = new Date(startDate);
    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setDate(endDateTime.getDate() + 1);
      whereCondition.NgayDat.lt = endDateTime;
    }
  }

  // Lấy tất cả đơn hàng với thông tin cơ sở
  const orders = await prisma.donHang.findMany({
    where: whereCondition,
    select: {
      MaDonHang: true,
      NgayDat: true,
      TongTien: true,
      MaCoSo: true,
      CoSo: {
        select: {
          TenCoSo: true,
        },
      },
    },
    orderBy: { NgayDat: 'asc' },
  });

  // Nhóm theo cơ sở và thời gian
  const grouped = {};
  
  orders.forEach(order => {
    const date = new Date(order.NgayDat);
    let key;
    
    if (groupBy === 'day') {
      key = date.toISOString().split('T')[0]; // YYYY-MM-DD
    } else if (groupBy === 'week') {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      key = weekStart.toISOString().split('T')[0];
    } else if (groupBy === 'month') {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
    } else if (groupBy === 'year') {
      key = String(date.getFullYear());
    }

    if (!grouped[key]) {
      grouped[key] = {
        period: key,
        branches: {},
      };
    }

    const branchId = order.MaCoSo;
    const branchName = order.CoSo?.TenCoSo || `Cơ sở ${branchId}`;
    
    if (!grouped[key].branches[branchId]) {
      grouped[key].branches[branchId] = {
        branchId,
        branchName,
        revenue: 0,
        orderCount: 0,
      };
    }
    
    grouped[key].branches[branchId].revenue += Number(order.TongTien) || 0;
    grouped[key].branches[branchId].orderCount += 1;
  });

  // Chuyển đổi sang format dễ dùng cho frontend
  const result = Object.values(grouped).map(item => {
    const data = {
      period: item.period,
    };
    
    Object.values(item.branches).forEach(branch => {
      data[branch.branchName] = branch.revenue;
      data[`${branch.branchName}_orders`] = branch.orderCount;
    });
    
    return data;
  }).sort((a, b) => a.period.localeCompare(b.period));

  return result;
}

/**
 * Dashboard overview - Tổng quan nhanh
 * @param {Object} options - { branchId }
 */
async function getDashboardOverview(options = {}) {
  const { branchId } = options;
  const now = new Date();
  
  // Database lưu giờ VN nhưng Prisma đọc như UTC
  // Cần lấy 00:00:00 theo giờ VN, rồi trừ 7 giờ để có giá trị UTC tương ứng
  const nowVN = new Date(now.getTime() + 7 * 60 * 60 * 1000); // Giờ VN
  const todayVN = new Date(nowVN.getFullYear(), nowVN.getMonth(), nowVN.getDate()); // 00:00:00 VN
  const today = new Date(todayVN.getTime() - 7 * 60 * 60 * 1000); // Chuyển về UTC để so sánh
  
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  
  const startOfMonthVN = new Date(nowVN.getFullYear(), nowVN.getMonth(), 1);
  const startOfMonth = new Date(startOfMonthVN.getTime() - 7 * 60 * 60 * 1000);

  const whereBase = branchId ? { MaCoSo: Number(branchId) } : {};

  const [
    todayStats,
    weekStats,
    monthStats,
    totalStats,
  ] = await Promise.all([
    // Hôm nay
    prisma.donHang.aggregate({
      where: { ...whereBase, NgayDat: { gte: today } },
      _count: { MaDonHang: true },
      _sum: { TongTien: true },
    }),
    // Tuần này
    prisma.donHang.aggregate({
      where: { ...whereBase, NgayDat: { gte: startOfWeek } },
      _count: { MaDonHang: true },
      _sum: { TongTien: true },
    }),
    // Tháng này
    prisma.donHang.aggregate({
      where: { ...whereBase, NgayDat: { gte: startOfMonth } },
      _count: { MaDonHang: true },
      _sum: { TongTien: true },
    }),
    // Tổng toàn bộ
    prisma.donHang.aggregate({
      where: whereBase,
      _count: { MaDonHang: true },
      _sum: { TongTien: true, TienGiamGia: true },
      _avg: { TongTien: true },
    }),
  ]);

  return {
    homNay: {
      soDonHang: todayStats._count.MaDonHang || 0,
      doanhThu: todayStats._sum.TongTien || 0,
    },
    tuanNay: {
      soDonHang: weekStats._count.MaDonHang || 0,
      doanhThu: weekStats._sum.TongTien || 0,
    },
    thangNay: {
      soDonHang: monthStats._count.MaDonHang || 0,
      doanhThu: monthStats._sum.TongTien || 0,
    },
    tongQuan: {
      tongSoDonHang: totalStats._count.MaDonHang || 0,
      tongDoanhThu: totalStats._sum.TongTien || 0,
      tongGiamGia: totalStats._sum.TienGiamGia || 0,
      giaTriTrungBinh: totalStats._avg.TongTien || 0,
    },
  };
}

module.exports = {
  getBestSellingProducts,
  getBestSellingCombos,
  getRevenueByBranch,
  getOverallRevenue,
  getOrderCountByPeriod,
  getOrdersByStatus,
  getOrdersByPaymentMethod,
  getDashboardOverview,
  getRevenueComparisonByBranch,
};
