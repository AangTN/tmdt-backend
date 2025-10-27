const prisma = require('../../client');

const findAllTypes = async () => {
  return prisma.loaiMonAn.findMany({
    select: { MaLoaiMonAn: true, TenLoaiMonAn: true },
    orderBy: { MaLoaiMonAn: 'asc' },
  });
};

module.exports = { findAllTypes };
