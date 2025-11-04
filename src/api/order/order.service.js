const repo = require('./order.repository');
const shippingService = require('./shipping.service');
const { createPaymentUrl } = require('../../utils/vnpay');

function toNumber(x) {
  if (x == null) return 0;
  const n = Number(x);
  return Number.isFinite(n) ? n : 0;
}

function validateItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    const e = new Error('Danh sách sản phẩm trống');
    e.status = 400;
    throw e;
  }
  for (const it of items) {
    if (!it.maBienThe || toNumber(it.soLuong) <= 0) {
      const e = new Error('Sản phẩm không hợp lệ: thiếu maBienThe hoặc soLuong');
      e.status = 400;
      throw e;
    }
  }
}

function calcDiscountAmount(voucher, subtotal) {
  if (!voucher) return 0;
  const min = voucher.DieuKienApDung ? Number(voucher.DieuKienApDung) : 0;
  if (min && subtotal < min) return 0;
  const type = String(voucher.LoaiGiamGia || '').toUpperCase();
  if (type === 'PERCENT') {
    const percent = Number(voucher.GiaTri) || 0;
    return Math.floor((subtotal * percent) / 100);
  }
  if (type === 'AMOUNT') {
    return Number(voucher.GiaTri) || 0;
  }
  return 0;
}

const getAllOrders = () => repo.findAllOrdersBasic();
const getOrderById = (id) => repo.findOrderByIdDetailed(id);
const getOrdersByUserId = (userId) => repo.findOrdersByUserIdBasic(userId);
const getOrdersByBranchId = (branchId) => repo.findOrdersByBranchIdBasic(branchId);

async function cancelOrder(maDonHang) {
  if (!maDonHang) {
    const e = new Error('Thiếu id đơn hàng');
    e.status = 400;
    throw e;
  }
  return repo.cancelOrderById(Number(maDonHang));
}

async function createOrder(payload) {
  if (!payload) {
    const e = new Error('Thiếu dữ liệu đơn hàng');
    e.status = 400;
    throw e;
  }

  validateItems(payload.items);

  const shippingAddress = {
    soNhaDuong: payload.soNhaDuong || payload.soNhaDuongGiaoHang,
    phuongXa: payload.phuongXa || payload.phuongXaGiaoHang,
    quanHuyen: payload.quanHuyen || payload.quanHuyenGiaoHang,
    thanhPho: payload.thanhPho || payload.thanhPhoGiaoHang,
  };

  if (!shippingAddress.soNhaDuong || !shippingAddress.phuongXa || !shippingAddress.quanHuyen || !shippingAddress.thanhPho) {
    const e = new Error('Thiếu địa chỉ giao hàng đầy đủ');
    e.status = 400;
    throw e;
  }

  const shippingQuote = await shippingService.quoteShipping(shippingAddress);
  if (!shippingQuote.canShip) {
    const e = new Error(shippingQuote.message || 'Không thể giao tới địa chỉ này');
    e.status = 400;
    throw e;
  }

  const branch = shippingQuote.branch;
  if (!branch?.MaCoSo) {
    const e = new Error('Không xác định được cơ sở gần nhất');
    e.status = 500;
    throw e;
  }

  const phiShipFromQuote = toNumber(shippingQuote.fee);
  const etaMinutes = shippingQuote.etaMinutes ?? 0;
  const estimatedDeliveryTime = etaMinutes
    ? new Date(Date.now() + etaMinutes * 60000)
    : null;

  // 1) Recalculate line totals from DB prices
  let subtotal = 0;
  const normalizedItems = [];
  for (const it of payload.items) {
    const variant = await repo.getVariant(it.maBienThe);
    if (!variant) {
      const e = new Error(`Dữ liệu sản phẩm đã cũ. Vui lòng thêm lại sản phẩm vào giỏ hàng: ${it.maBienThe}`);
      e.status = 409;
      e.code = 'STALE_CART';
      throw e;
    }
    const qty = toNumber(it.soLuong);
    let unitPrice = Number(variant.GiaBan);
    const optionCreates = [];
    if (Array.isArray(it.tuyChon) && it.tuyChon.length) {
      for (const t of it.tuyChon) {
        const rec = await repo.getOptionExtraForSize(t.maTuyChon, variant.MaSize);
        const extra = rec ? Number(rec.GiaThem) : 0;
        unitPrice += extra;
        optionCreates.push({ maTuyChon: t.maTuyChon, giaThem: extra });
      }
    }
    const lineTotal = unitPrice * qty;
    subtotal += lineTotal;

    normalizedItems.push({
      maBienThe: variant.MaBienThe,
      maDeBanh: it.maDeBanh ?? null,
      soLuong: qty,
      donGia: unitPrice,
      thanhTien: lineTotal,
      tuyChon: optionCreates,
    });
  }

  // 2) Validate voucher
  let discount = 0;
  if (payload.maVoucher) {
    const v = await repo.getVoucherForValidation(payload.maVoucher);
    if (!v) {
      const e = new Error('Voucher không tồn tại');
      e.status = 400;
      throw e;
    }
    if (String(v.TrangThai).toLowerCase() !== 'active') {
      const e = new Error('Voucher không còn hiệu lực');
      e.status = 400;
      throw e;
    }
    const now = new Date();
    if (v.NgayBatDau && new Date(v.NgayBatDau) > now) {
      const e = new Error('Voucher chưa đến thời gian áp dụng');
      e.status = 400;
      throw e;
    }
    if (v.NgayKetThuc && new Date(v.NgayKetThuc) < now) {
      const e = new Error('Voucher đã hết hạn');
      e.status = 400;
      throw e;
    }
    if (typeof v.SoLuong === 'number' && v._count?.DonHang >= v.SoLuong) {
      const e = new Error('Voucher đã hết số lượng');
      e.status = 400;
      throw e;
    }
    discount = calcDiscountAmount(v, subtotal);
    if (discount > subtotal) discount = subtotal;
  }

  // 3) Compute totals
  const phiShip = phiShipFromQuote;
  const expectedTotal = subtotal - discount + phiShip;

  // 3.1) Validate frontend total matches backend calculation
  if (payload.tongTien !== undefined && payload.tongTien !== null) {
    const frontendTotal = toNumber(payload.tongTien);
    // Allow small floating point difference (0.01 VND tolerance)
    if (Math.abs(frontendTotal - expectedTotal) > 0.01) {
      const e = new Error('Dữ liệu giỏ hàng đã thay đổi. Vui lòng cập nhật giỏ hàng.');
      e.status = 409; // Conflict - stale cart
      e.code = 'STALE_CART';
      throw e;
    }
  }

  // 4) Prepare create payload using server-calculated numbers
  // Validate payment method: accept only exact Vietnamese strings sent by frontend
  // Frontend must send either 'Tiền Mặt' or 'Chuyển Khoản' (trimmed). Anything else -> 400
  const rawPayment = (payload.payment && payload.payment.phuongThuc) || payload.phuongThuc;
  if (!rawPayment || typeof rawPayment !== 'string') {
    const e = new Error('Phương thức thanh toán không hợp lệ. Chỉ chấp nhận: Tiền Mặt hoặc Chuyển Khoản');
    e.status = 400;
    throw e;
  }
  const trimmedPayment = rawPayment.trim();
  const lower = trimmedPayment.toLowerCase();
  if (lower !== 'tiền mặt' && lower !== 'chuyển khoản') {
    const e = new Error('Phương thức thanh toán không hợp lệ. Chỉ chấp nhận: Tiền Mặt hoặc Chuyển Khoản');
    e.status = 400;
    throw e;
  }

  // Normalize stored Vietnamese value to canonical capitalization
  const storedPaymentValue = lower === 'tiền mặt' ? 'Tiền Mặt' : 'Chuyển Khoản';

  const createPayload = {
    ...payload,
    maCoSo: branch.MaCoSo,
    items: normalizedItems,
    tienTruocGiamGia: subtotal,
    tienGiamGia: discount,
    tongTien: expectedTotal,
    phiShip,
    thoiGianGiaoDuKien: estimatedDeliveryTime,
    soNhaDuongGiaoHang: shippingAddress.soNhaDuong,
    phuongXaGiaoHang: shippingAddress.phuongXa,
    quanHuyenGiaoHang: shippingAddress.quanHuyen,
    thanhPhoGiaoHang: shippingAddress.thanhPho,
    payment: {
      phuongThuc: storedPaymentValue,
      soTien: expectedTotal,
      maGiaoDich: payload.payment?.maGiaoDich || null,
    },
  };

  const { MaDonHang } = await repo.createOrderWithDetails(createPayload);

  // Determine behavior based on stored Vietnamese payment method ('Tiền Mặt' or 'Chuyển Khoản')
  // We store the canonical capitalized form ('Tiền Mặt' / 'Chuyển Khoản'), so compare against that.
  const storedPhuongThuc = String(createPayload.payment?.phuongThuc || '').trim();

  if (storedPhuongThuc === 'Tiền Mặt') {
    return {
      orderId: MaDonHang,
      total: expectedTotal,
      discount,
      subtotal,
      phiShip,
      branch,
      distanceKm: shippingQuote.distanceKm,
      etaMinutes,
      next: 'Tiền Mặt',
    };
  }

  if (storedPhuongThuc === 'Chuyển Khoản') {
    let paymentData;
    try {
      paymentData = createPaymentUrl({
        amount: expectedTotal,
        orderId: MaDonHang,
        orderInfo: payload.payment?.orderInfo,
        bankCode: payload.payment?.bankCode,
        locale: payload.payment?.locale,
        orderType: payload.payment?.orderType,
        returnUrl: payload.payment?.returnUrl,
        ipAddr: payload.payment?.ipAddress || payload.clientIp || payload.ipAddr,
        txnRef: payload.payment?.txnRef,
        expireMinutes: payload.payment?.expireMinutes
      });
    } catch (err) {
      console.error('Error creating VNPay payment URL:', err);
      const e = new Error('Không tạo được liên kết thanh toán VNPay');
      e.status = 500;
      throw e;
    }

    return {
      orderId: MaDonHang,
      total: expectedTotal,
      discount,
      subtotal,
      phiShip,
      branch,
      distanceKm: shippingQuote.distanceKm,
      etaMinutes,
      next: 'Chuyển Khoản',
      paymentUrl: paymentData.url,
      paymentGateway: 'VNPay',
      paymentTxnRef: paymentData.params.vnp_TxnRef,
      paymentExpireAt: paymentData.params.vnp_ExpireDate,
    };
  }

  // Fallback - should not happen because we validated earlier, but return generic response
  return {
    orderId: MaDonHang,
    total: expectedTotal,
    discount,
    subtotal,
    phiShip,
    branch,
    distanceKm: shippingQuote.distanceKm,
    etaMinutes,
    next: 'UNKNOWN',
  };
}

module.exports = {
  getAllOrders,
  getOrderById,
  getOrdersByUserId,
  getOrdersByBranchId,
  createOrder,
  cancelOrder,
};

