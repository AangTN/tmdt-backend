const prisma = require('../../client');

async function findUserById(maNguoiDung) {
  return prisma.nguoiDung.findUnique({
    where: { MaNguoiDung: Number(maNguoiDung) },
    include: {
      TaiKhoan: {
        select: {
          MaTaiKhoan: true,
          Email: true,
          Role: true,
        },
      },
      CoSo: {
        select: {
          MaCoSo: true,
          TenCoSo: true,
        },
      },
    },
  });
}

async function updateUser(maNguoiDung, data) {
  return prisma.nguoiDung.update({
    where: { MaNguoiDung: Number(maNguoiDung) },
    data: {
      HoTen: data.hoTen,
      SoDienThoai: data.soDienThoai,
      SoNhaDuong: data.soNhaDuong || null,
      PhuongXa: data.phuongXa || null,
      QuanHuyen: data.quanHuyen || null,
      ThanhPho: data.thanhPho || null,
    },
    include: {
      TaiKhoan: {
        select: {
          MaTaiKhoan: true,
          Email: true,
          Role: true,
        },
      },
    },
  });
}

async function checkPhoneExists(soDienThoai, excludeMaNguoiDung = null) {
  const where = { SoDienThoai: String(soDienThoai) };
  if (excludeMaNguoiDung) {
    where.NOT = { MaNguoiDung: Number(excludeMaNguoiDung) };
  }
  
  const user = await prisma.nguoiDung.findFirst({ where });
  return !!user;
}

module.exports = {
  findUserById,
  updateUser,
  checkPhoneExists,
};
