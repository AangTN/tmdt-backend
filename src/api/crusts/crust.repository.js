const prisma = require('../../client');

const findAllCrusts = async () => {
  return prisma.deBanh.findMany({
    select: {
      MaDeBanh: true,
      TenDeBanh: true,
    },
    orderBy: { MaDeBanh: 'asc' },
  });
};

module.exports = { findAllCrusts };
