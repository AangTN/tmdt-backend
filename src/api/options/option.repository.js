const prisma = require('../../client');

// Get all option types with their options and pricing by size
const findAllOptions = async () => {
  return prisma.loaiTuyChon.findMany({
    include: {
      TuyChon: {
        include: {
          TuyChon_Gia: {
            include: {
              Size: true,
            },
          },
        },
      },
    },
    orderBy: { MaLoaiTuyChon: 'asc' },
  });
};

module.exports = { findAllOptions };
