const prisma = require('../../client');

const findAllCategories = async () => {
  return prisma.danhMuc.findMany({
    select: { MaDanhMuc: true, TenDanhMuc: true },
    orderBy: { MaDanhMuc: 'asc' },
  });
};

module.exports = { findAllCategories };
