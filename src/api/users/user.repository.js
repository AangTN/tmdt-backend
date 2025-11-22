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
async function updateAccountStatusByUser(MaNguoiDung, status) {
  // Find the user's account id first
  const user = await prisma.nguoiDung.findUnique({
    where: { MaNguoiDung: Number(MaNguoiDung) },
    include: { TaiKhoan: { select: { MaTaiKhoan: true } } },
  });

  if (!user || !user.TaiKhoan) {
    return null;
  }

  const MaTaiKhoan = user.TaiKhoan.MaTaiKhoan;

  const updated = await prisma.taiKhoan.update({
    where: { MaTaiKhoan: Number(MaTaiKhoan) },
    data: { TrangThai: status },
  });

  return updated;
}


async function checkPhoneExists(soDienThoai, excludeMaNguoiDung = null) {
  const where = { SoDienThoai: String(soDienThoai) };
  if (excludeMaNguoiDung) {
    where.NOT = { MaNguoiDung: Number(excludeMaNguoiDung) };
  }
  
  const user = await prisma.nguoiDung.findFirst({ where });
  return !!user;
}

async function checkEmailExists(email) {
  const account = await prisma.taiKhoan.findUnique({
    where: { Email: String(email) },
  });
  return !!account;
}

async function checkBranchExists(maCoSo) {
  const branch = await prisma.coSo.findUnique({
    where: { MaCoSo: Number(maCoSo) },
  });
  return !!branch;
}

async function createUser(data) {
  // Create account and user in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create TaiKhoan
    const taiKhoan = await tx.taiKhoan.create({
      data: {
        Email: data.email,
        MatKhau: data.matKhau,
        Role: data.role || 'CUSTOMER',
        TrangThai: 'Active',
      },
    });

    // Create NguoiDung
    const nguoiDung = await tx.nguoiDung.create({
      data: {
        MaTaiKhoan: taiKhoan.MaTaiKhoan,
        HoTen: data.hoTen,
        SoDienThoai: data.soDienThoai,
        MaCoSo: data.maCoSo || null,
      },
    });

    return {
      taiKhoan: {
        MaTaiKhoan: taiKhoan.MaTaiKhoan,
        Email: taiKhoan.Email,
        Role: taiKhoan.Role,
        TrangThai: taiKhoan.TrangThai,
      },
      nguoiDung: {
        MaNguoiDung: nguoiDung.MaNguoiDung,
        HoTen: nguoiDung.HoTen,
        SoDienThoai: nguoiDung.SoDienThoai,
      },
    };
  });

  return result;
}

async function getAllAccounts() {
  const accounts = await prisma.taiKhoan.findMany({
    select: {
      MaTaiKhoan: true,
      Email: true,
      Role: true,
      TrangThai: true,
      NguoiDung: {
        select: {
          MaNguoiDung: true,
          HoTen: true,
          SoDienThoai: true,
          SoNhaDuong: true,
          PhuongXa: true,
          QuanHuyen: true,
          ThanhPho: true,
        },
      },
    },
  });

  // For each account, compute order count and total via donHang.aggregate
  const accountsWithStats = await Promise.all(
    accounts.map(async (account) => {
      const maNguoiDung = account.NguoiDung?.MaNguoiDung;
      if (!maNguoiDung) {
        return {
          ...account,
          SoLuongDonHang: 0,
          TongTienDonHang: 0,
        };
      }

      // Count and sum only orders whose latest history status is 'Đã giao'
      const delivered = await prisma.$queryRaw`
        SELECT COALESCE(COUNT(*),0) AS cnt, COALESCE(SUM(dh."TongTien"),0) AS sum
        FROM "DonHang" dh
        JOIN LATERAL (
          SELECT l."TrangThai"
          FROM "LichSuTrangThaiDonHang" l
          WHERE l."MaDonHang" = dh."MaDonHang"
          ORDER BY l."ThoiGianCapNhat" DESC
          LIMIT 1
        ) last_status ON last_status."TrangThai" = 'Đã giao'
        WHERE dh."MaNguoiDung" = ${maNguoiDung}
      `;

      const cnt = delivered && delivered[0] ? Number(delivered[0].cnt || 0) : 0;
      const sum = delivered && delivered[0] ? Number(delivered[0].sum || 0) : 0;

      return {
        ...account,
        SoLuongDonHang: cnt,
        TongTienDonHang: sum,
      };
    })
  );

  return accountsWithStats;
}

module.exports = {
  findUserById,
  updateUser,
  updateAccountStatusByUser,
  checkPhoneExists,
  checkEmailExists,
  checkBranchExists,
  createUser,
  getAllAccounts,
};
