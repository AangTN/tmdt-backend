const prisma = require('../../client');

async function findAllVouchers() {
  return prisma.voucher.findMany({
    orderBy: { MaVoucher: 'asc' },
    include: { _count: { select: { DonHang: true } } },
  });
}

async function findVoucherByCode(code) {
  return prisma.voucher.findUnique({
    where: { MaVoucher: String(code) },
    include: { _count: { select: { DonHang: true } } },
  });
}

module.exports = { findAllVouchers, findVoucherByCode };
