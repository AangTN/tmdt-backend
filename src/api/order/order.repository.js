const prisma = require('../../client');

// Select common fields for basic listings (no heavy relations)
const basicOrderSelect = {
  MaDonHang: true,
  MaNguoiDung: true,
  MaCoSo: true,
  MaNguoiDungGiaoHang: true,
  MaVoucher: true,
  NgayDat: true,
  ThoiGianGiaoDuKien: true,
  TienTruocGiamGia: true,
  TienGiamGia: true,
  TongTien: true,
  PhiShip: true,
  GhiChu: true,
  TenNguoiNhan: true,
  SoDienThoaiGiaoHang: true,
  SoNhaDuongGiaoHang: true,
  PhuongXaGiaoHang: true,
  QuanHuyenGiaoHang: true,
  ThanhPhoGiaoHang: true,
};

async function findAllOrdersBasic() {
  return prisma.donHang.findMany({
    orderBy: { NgayDat: 'desc' },
    select: {
      ...basicOrderSelect,
      CoSo: { select: { MaCoSo: true, TenCoSo: true } },
      NguoiDung: { select: { MaNguoiDung: true, HoTen: true } },
      Voucher: { select: { MaVoucher: true, MoTa: true } },
      ThanhToan: { select: { MaThanhToan: true, PhuongThuc: true, TrangThai: true, SoTien: true, ThoiGian: true } },
      LichSuTrangThaiDonHang: { orderBy: { ThoiGianCapNhat: 'desc' } },
    },
  });
}

async function findOrdersByUserIdBasic(userId) {
  return prisma.donHang.findMany({
    where: { MaNguoiDung: Number(userId) },
    orderBy: { NgayDat: 'desc' },
    select: {
      ...basicOrderSelect,
      CoSo: { select: { MaCoSo: true, TenCoSo: true } },
      Voucher: { select: { MaVoucher: true, MoTa: true } },
      ThanhToan: { select: { MaThanhToan: true, PhuongThuc: true, TrangThai: true, SoTien: true, ThoiGian: true } },
      LichSuTrangThaiDonHang: { orderBy: { ThoiGianCapNhat: 'desc' } },
    },
  });
}

async function findOrdersByBranchIdBasic(branchId) {
  return prisma.donHang.findMany({
    where: { MaCoSo: Number(branchId) },
    orderBy: { NgayDat: 'desc' },
    select: {
      ...basicOrderSelect,
      NguoiDung: { select: { MaNguoiDung: true, HoTen: true } },
      Voucher: { select: { MaVoucher: true, MoTa: true } },
      ThanhToan: { select: { MaThanhToan: true, PhuongThuc: true, TrangThai: true, SoTien: true, ThoiGian: true } },
      LichSuTrangThaiDonHang: { orderBy: { ThoiGianCapNhat: 'desc' } },
    },
  });
}

async function findOrdersByPhoneBasic(soDienThoai) {
  return prisma.donHang.findMany({
    where: { SoDienThoaiGiaoHang: String(soDienThoai) },
    orderBy: { NgayDat: 'desc' },
    select: {
      ...basicOrderSelect,
      CoSo: { select: { MaCoSo: true, TenCoSo: true } },
      NguoiDung: { select: { MaNguoiDung: true, HoTen: true } },
      Voucher: { select: { MaVoucher: true, MoTa: true } },
      ThanhToan: { select: { MaThanhToan: true, PhuongThuc: true, TrangThai: true, SoTien: true, ThoiGian: true } },
      LichSuTrangThaiDonHang: { orderBy: { ThoiGianCapNhat: 'desc' } },
    },
  });
}

async function findOrderByIdDetailed(id) {
  return prisma.donHang.findUnique({
    where: { MaDonHang: Number(id) },
    include: {
      ChiTietDonHang: {
        include: {
          BienTheMonAn: {
            include: {
              MonAn: true,
              Size: true,
            },
          },
          DeBanh: true,
          Combo: {
            select: {
              MaCombo: true,
              TenCombo: true,
              MoTa: true,
              HinhAnh: true,
              GiaCombo: true,
              TrangThai: true,
            },
          },
          ChiTietDonHang_TuyChon: {
            include: { 
              TuyChon: {
                include: {
                  LoaiTuyChon: true,
                },
              },
            },
          },
          ChiTietDonHang_ChiTietCombo: {
            orderBy: {
              MaCTDH_Combo: 'asc',
            },
            include: {
              BienTheMonAn: {
                include: {
                  MonAn: true,
                  Size: true,
                },
              },
              DeBanh: true,
            },
          },
        },
      },
      ThanhToan: true,
      Voucher: true,
      CoSo: true,
      NguoiGiaoHang: true,
      NguoiDung: true,
      LichSuTrangThaiDonHang: { orderBy: { ThoiGianCapNhat: 'desc' } },
    },
  });
}

async function createOrderWithDetails(orderInput) {
  const {
    maNguoiDung = null,
    maCoSo,
    maVoucher = null,
    ngayDat = new Date(),
    thoiGianGiaoDuKien = null,
    tienTruocGiamGia = null,
    tienGiamGia = null,
    tongTien,
    phiShip = null,
    ghiChu = null,
    tenNguoiNhan = null,
    soDienThoaiGiaoHang = null,
    soNhaDuongGiaoHang = null,
    phuongXaGiaoHang = null,
    quanHuyenGiaoHang = null,
    thanhPhoGiaoHang = null,
    items = [],
    payment = { phuongThuc: 'COD', soTien: 0, maGiaoDich: null },
    skipPaymentCreation = false,
  } = orderInput;

  return prisma.$transaction(async (tx) => {
    // Xác định trạng thái đơn hàng dựa vào phương thức thanh toán
    const isTransfer = String(payment.phuongThuc || '').trim().toLowerCase() === 'chuyển khoản';
    const initialStatus = isTransfer ? 'Chờ thanh toán' : 'Đang chờ xác nhận';

    // Create order first
    const created = await tx.donHang.create({
      data: {
        MaNguoiDung: maNguoiDung,
        MaCoSo: maCoSo,
        MaNguoiDungGiaoHang: null,
        MaVoucher: maVoucher,
        NgayDat: new Date(ngayDat),
        ThoiGianGiaoDuKien: thoiGianGiaoDuKien ? new Date(thoiGianGiaoDuKien) : null,
        TienTruocGiamGia: tienTruocGiamGia,
        TienGiamGia: tienGiamGia,
        TongTien: tongTien,
        PhiShip: phiShip,
        GhiChu: ghiChu,
        TenNguoiNhan: tenNguoiNhan,
        SoDienThoaiGiaoHang: soDienThoaiGiaoHang,
        SoNhaDuongGiaoHang: soNhaDuongGiaoHang,
        PhuongXaGiaoHang: phuongXaGiaoHang,
        QuanHuyenGiaoHang: quanHuyenGiaoHang,
        ThanhPhoGiaoHang: thanhPhoGiaoHang,
      },
      select: { MaDonHang: true },
    });

    // Create order details
    for (const it of items) {
      // Xác định xem đây là sản phẩm thường hay combo
      const isCombo = it.loai === 'CB';
      
      const detail = await tx.chiTietDonHang.create({
        data: {
          MaDonHang: created.MaDonHang,
          MaBienThe: it.maBienThe,
          MaDeBanh: it.maDeBanh ?? null,
          SoLuong: it.soLuong,
          DonGia: it.donGia,
          ThanhTien: it.thanhTien,
          Loai: isCombo ? 'CB' : 'SP',
          MaCombo: isCombo ? it.maCombo : null,
        },
        select: { MaChiTiet: true },
      });

      if (isCombo) {
        // Tạo chi tiết combo
        if (it.chiTietCombo && it.chiTietCombo.length) {
          await tx.chiTietDonHang_ChiTietCombo.createMany({
            data: it.chiTietCombo.map((ctc) => ({
              MaChiTietDonHang: detail.MaChiTiet,
              MaBienThe: ctc.maBienThe,
              MaDeBanh: ctc.maDeBanh ?? null,
              SoLuong: ctc.soLuong,
            })),
          });
        }
      } else {
        // Tạo tùy chọn cho sản phẩm thường
        if (it.tuyChon && it.tuyChon.length) {
          await tx.chiTietDonHang_TuyChon.createMany({
            data: it.tuyChon.map((t) => ({
              MaChiTiet: detail.MaChiTiet,
              MaTuyChon: t.maTuyChon,
              GiaThem: t.giaThem ?? 0,
            })),
          });
        }
      }
    }

    // Create payment only if not skipped (for Chuyển Khoản, we skip and create later)
    if (!skipPaymentCreation) {
      await tx.thanhToan.create({
        data: {
          MaDonHang: created.MaDonHang,
          PhuongThuc: payment.phuongThuc,
          MaGiaoDich: payment.maGiaoDich ?? null,
          SoTien: payment.soTien ?? 0,
          TrangThai: 'Chưa thanh toán',
          ThoiGian: new Date(),
        },
      });
    }

    // Create initial order status history with appropriate status
    await tx.lichSuTrangThaiDonHang.create({
      data: {
        MaDonHang: created.MaDonHang,
        TrangThai: initialStatus,
        ThoiGianCapNhat: new Date(),
        GhiChu: null,
      },
    });

    return created; // { MaDonHang }
  });
}

// Cancel order: allowed only when order is unpaid (ThanhToan missing or Pending)
// and latest status is 'Đang chờ xác nhận'. This will insert a new LichSuTrangThaiDonHang entry
// with TrangThai = 'Khách hàng đã hủy'. Returns the updated MaDonHang on success.
async function cancelOrderById(maDonHang) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.donHang.findUnique({
      where: { MaDonHang: Number(maDonHang) },
      include: {
        ThanhToan: true,
        LichSuTrangThaiDonHang: { orderBy: { ThoiGianCapNhat: 'desc' }, take: 1 },
      },
    });

    if (!order) {
      const e = new Error('Không tìm thấy đơn hàng');
      e.status = 404;
      throw e;
    }

    // Check payment status: allow cancel if no payment record or payment is pending
    const thanhToan = order.ThanhToan;
    if (thanhToan && typeof thanhToan.TrangThai === 'string') {
      const st = thanhToan.TrangThai.toLowerCase();
      // If payment already completed (not 'pending'), reject
      if (st !== 'pending' && st !== 'pending' && st !== 'chưa thanh toán') {
        const e = new Error('Đơn hàng đã được thanh toán, không thể hủy');
        e.status = 400;
        throw e;
      }
    }

    // Check latest status
    const latest = order.LichSuTrangThaiDonHang && order.LichSuTrangThaiDonHang[0];
    if (!latest || String(latest.TrangThai) !== 'Đang chờ xác nhận') {
      const e = new Error('Chỉ có đơn ở trạng thái "Đang chờ xác nhận" mới được hủy bởi khách hàng');
      e.status = 400;
      throw e;
    }

    // Insert cancellation history
    await tx.lichSuTrangThaiDonHang.create({
      data: {
        MaDonHang: order.MaDonHang,
        TrangThai: 'Khách hàng đã hủy',
        ThoiGianCapNhat: new Date(),
        GhiChu: 'Hủy bởi khách hàng',
      },
    });

    return { MaDonHang: order.MaDonHang };
  });
}

// Helpers for validation/calculation
async function getVariant(maBienThe) {
  return prisma.bienTheMonAn.findUnique({
    where: { MaBienThe: Number(maBienThe) },
    select: { MaBienThe: true, GiaBan: true, MaSize: true },
  });
}

async function getCombo(maCombo) {
  return prisma.combo.findUnique({
    where: { MaCombo: Number(maCombo) },
    include: {
      Combo_ChiTiet: {
        select: {
          MaBienThe: true,
          SoLuong: true,
          MaDeBanh: true,
        },
      },
    },
  });
}

async function getOptionExtraForSize(maTuyChon, maSize) {
  if (maSize == null) return null;
  return prisma.tuyChon_Gia.findUnique({
    where: { MaTuyChon_MaSize: { MaTuyChon: Number(maTuyChon), MaSize: Number(maSize) } },
    select: { GiaThem: true },
  });
}

async function getVoucherForValidation(code) {
  if (!code) return null;
  return prisma.voucher.findUnique({
    where: { MaVoucher: String(code) },
    include: { _count: { select: { DonHang: true } } },
  });
}

async function findPaymentByTransactionCode(maGiaoDich) {
  if (!maGiaoDich) return null;
  return prisma.thanhToan.findUnique({
    where: { MaGiaoDich: String(maGiaoDich) },
  });
}

async function createPaymentForOrder(paymentData) {
  return prisma.thanhToan.create({
    data: {
      MaDonHang: Number(paymentData.maDonHang),
      PhuongThuc: paymentData.phuongThuc,
      TrangThai: paymentData.trangThai,
      SoTien: paymentData.soTien,
      MaGiaoDich: paymentData.maGiaoDich || null,
      ThoiGian: new Date(),
    },
  });
}

async function updateOrderStatus(maDonHang, trangThai, ghiChu = null) {
  return prisma.$transaction(async (tx) => {
    // Tạo lịch sử trạng thái mới
    await tx.lichSuTrangThaiDonHang.create({
      data: {
        MaDonHang: Number(maDonHang),
        TrangThai: trangThai,
        ThoiGianCapNhat: new Date(),
        GhiChu: ghiChu,
      },
    });
    
    return { success: true };
  });
}

async function updatePaymentStatus(maDonHang, paymentData) {
  return prisma.thanhToan.update({
    where: { MaDonHang: Number(maDonHang) },
    data: {
      TrangThai: paymentData.trangThai,
      MaGiaoDich: paymentData.maGiaoDich || undefined,
    },
  });
}

async function createOrderReview(data) {
  return prisma.danhGiaDonHang.create({
    data: {
      MaDonHang: data.maDonHang,
      SoSao: data.soSao,
      BinhLuan: data.binhLuan,
      NgayDanhGia: new Date(),
    },
    include: {
      DonHang: {
        select: {
          MaDonHang: true,
          NgayDat: true,
          TongTien: true,
          NguoiDung: {
            select: {
              HoTen: true,
            },
          },
        },
      },
    },
  });
}

async function findOrderReview(maDonHang) {
  return prisma.danhGiaDonHang.findUnique({
    where: { MaDonHang: Number(maDonHang) },
    include: {
      DonHang: {
        select: {
          MaDonHang: true,
          NgayDat: true,
          TongTien: true,
          NguoiDung: {
            select: {
              HoTen: true,
            },
          },
        },
      },
    },
  });
}

module.exports = {
  findAllOrdersBasic,
  findOrdersByUserIdBasic,
  findOrdersByBranchIdBasic,
  findOrdersByPhoneBasic,
  findOrderByIdDetailed,
  createOrderWithDetails,
  cancelOrderById,
  getVariant,
  findPaymentByTransactionCode,
  createPaymentForOrder,
  updateOrderStatus,
  getCombo,
  getOptionExtraForSize,
  getVoucherForValidation,
  updatePaymentStatus,
  createOrderReview,
  findOrderReview,
};

