const prisma = require('../../client');

async function findUserByEmail(email) {
  return prisma.taiKhoan.findUnique({
    where: { Email: email },
    include: {
      NguoiDung: true,
    },
  });
}

async function createUser({ email, hoTen, matKhau, soDienThoai }) {
  // Create TaiKhoan first
  const taiKhoan = await prisma.taiKhoan.create({
    data: {
      Email: email,
      MatKhau: matKhau,
      Role: 'CUSTOMER',
    },
  });

  // Create NguoiDung linked to TaiKhoan
  const nguoiDung = await prisma.nguoiDung.create({
    data: {
      MaTaiKhoan: taiKhoan.MaTaiKhoan,
      HoTen: hoTen,
      SoDienThoai: soDienThoai || null,
    },
  });

  return {
    taiKhoan,
    nguoiDung,
  };
}

module.exports = {
  findUserByEmail,
  createUser,
};
