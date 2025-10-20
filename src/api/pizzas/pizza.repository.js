// src/api/pizzas/pizza.repository.js

const { PrismaClient } = require('@prisma/client');

// Initialize Prisma client
const prisma = new PrismaClient();

// Hàm của bạn (đã đúng)
const findAllPizzas = async () => {
  const pizzas = await prisma.monAn.findMany({
    where: {
      MaLoaiMonAn: 1,
    },
    include: {
      LoaiMonAn: true,
      BienTheMonAn: { include: { Size: true } },
      MonAn_DeBanh: { include: { DeBanh: true } },
      MonAn_TuyChon: { include: { TuyChon: true } },
      MonAn_DanhMuc: { include: { DanhMuc: true } },
    },
  });
  console.log(pizzas);
  return pizzas;
};

// PHẦN QUAN TRỌNG NHẤT NẰM Ở ĐÂY 👇
module.exports = {
  findAllPizzas,
};