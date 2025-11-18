const comboRepository = require('./combo.repository');

const getAllActiveCombos = () => comboRepository.findAllActiveCombos();
const getCombosByStatuses = (statuses = []) => comboRepository.findCombosByStatuses(statuses);

const getComboDetail = async (id) => {
  const combo = await comboRepository.findComboById(id);
  if (!combo) return null;
  // Chuẩn hoá trả về: tách danh sách chi tiết thành mảng items đơn giản
  const { Combo_ChiTiet = [], ...rest } = combo;
  const items = Combo_ChiTiet.map((ct) => ({
    MaCTCombo: ct.MaCTCombo,
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

const createCombo = async (comboData) => {
  // Validate data
  if (!comboData.tenCombo || !comboData.tenCombo.trim()) {
    const err = new Error('Tên combo là bắt buộc');
    err.status = 400;
    throw err;
  }
  if (!comboData.giaCombo || comboData.giaCombo <= 0) {
    const err = new Error('Giá combo phải lớn hơn 0');
    err.status = 400;
    throw err;
  }
  if (!comboData.hinhAnh) {
    const err = new Error('Hình ảnh combo là bắt buộc');
    err.status = 400;
    throw err;
  }
  if (!comboData.items || comboData.items.length === 0) {
    const err = new Error('Combo phải có ít nhất một món');
    err.status = 400;
    throw err;
  }

  // Validate items
  for (const item of comboData.items) {
    if (!item.maBienThe) {
      const err = new Error('Mỗi món phải có mã biến thể');
      err.status = 400;
      throw err;
    }
    if (!item.soLuong || item.soLuong <= 0) {
      const err = new Error('Số lượng món phải lớn hơn 0');
      err.status = 400;
      throw err;
    }
  }

  const combo = await comboRepository.createCombo(comboData);
  return combo;
};

const updateComboStatus = async (id, status) => {
  // Validate status
  const validStatuses = ['Active', 'Inactive'];
  if (!validStatuses.includes(status)) {
    const err = new Error('Trạng thái không hợp lệ. Chỉ chấp nhận Active hoặc Inactive');
    err.status = 400;
    throw err;
  }

  // Check if combo exists
  const combo = await comboRepository.findComboById(id);
  if (!combo) {
    const err = new Error('Không tìm thấy combo');
    err.status = 404;
    throw err;
  }

  return comboRepository.updateComboStatus(id, status);
};

const deleteCombo = async (id) => {
  // Check if combo exists
  const combo = await comboRepository.findComboById(id);
  if (!combo) {
    const err = new Error('Không tìm thấy combo');
    err.status = 404;
    throw err;
  }

  return comboRepository.deleteCombo(id);
};

const updateCombo = async (id, comboData) => {
  // Check if combo exists
  const combo = await comboRepository.findComboById(id);
  if (!combo) {
    const err = new Error('Không tìm thấy combo');
    err.status = 404;
    throw err;
  }

  // Validate data
  if (!comboData.giaCombo || comboData.giaCombo <= 0) {
    const err = new Error('Giá combo phải lớn hơn 0');
    err.status = 400;
    throw err;
  }
  if (!comboData.hinhAnh) {
    const err = new Error('Hình ảnh combo là bắt buộc');
    err.status = 400;
    throw err;
  }
  if (!comboData.items || comboData.items.length === 0) {
    const err = new Error('Combo phải có ít nhất một món');
    err.status = 400;
    throw err;
  }

  // Validate items
  for (const item of comboData.items) {
    if (!item.maBienThe) {
      const err = new Error('Mỗi món phải có mã biến thể');
      err.status = 400;
      throw err;
    }
    if (!item.soLuong || item.soLuong <= 0) {
      const err = new Error('Số lượng món phải lớn hơn 0');
      err.status = 400;
      throw err;
    }
  }

  return comboRepository.updateCombo(id, comboData);
};

module.exports = { 
  getAllActiveCombos, 
  getCombosByStatuses, 
  getComboDetail, 
  createCombo, 
  updateComboStatus, 
  deleteCombo,
  updateCombo 
};