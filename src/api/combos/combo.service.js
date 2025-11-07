const comboRepository = require('./combo.repository');

const getAllActiveCombos = () => comboRepository.findAllActiveCombos();

const getComboDetail = async (id) => {
  const combo = await comboRepository.findComboById(id);
  if (!combo) return null;
  // Chuẩn hoá trả về: tách danh sách chi tiết thành mảng items đơn giản
  const { Combo_ChiTiet = [], ...rest } = combo;
  const items = Combo_ChiTiet.map((ct) => ({
    MaBienThe: ct.MaBienThe,
    SoLuong: ct.SoLuong,
    MaDeBanh: ct.MaDeBanh,
    DeBanh: ct.DeBanh || null,
    BienTheMonAn: ct.BienTheMonAn
      ? {
          MaBienThe: ct.BienTheMonAn.MaBienThe,
          GiaBan: ct.BienTheMonAn.GiaBan,
          Size: ct.BienTheMonAn.Size || null,
          MonAn: ct.BienTheMonAn.MonAn || null,
        }
      : null,
  }));
  return { ...rest, Items: items };
};

module.exports = { getAllActiveCombos, getComboDetail };