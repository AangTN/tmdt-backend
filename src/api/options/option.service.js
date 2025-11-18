const optionRepository = require('./option.repository');

const getAllOptions = async () => {
  return optionRepository.findAllOptions();
};

const getAllOptionsAdmin = async () => {
  return optionRepository.findAllOptionsAdmin();
};

const getAllSizes = async () => {
  return optionRepository.findAllSizes();
};

const getAllOptionTypes = async () => {
  return optionRepository.findAllOptionTypes();
};

const createOption = async (optionData) => {
  // Validate
  if (!optionData.TenTuyChon || !optionData.MaLoaiTuyChon) {
    throw new Error('Tên tùy chọn và loại tùy chọn là bắt buộc');
  }

  if (!optionData.prices || optionData.prices.length === 0) {
    throw new Error('Phải có ít nhất một giá cho size');
  }

  return optionRepository.createOption(optionData);
};

const updateOption = async (id, optionData) => {
  // Check if option exists
  const option = await optionRepository.findOptionById(id);
  if (!option) {
    throw new Error('Không tìm thấy tùy chọn');
  }

  if (!optionData.prices || optionData.prices.length === 0) {
    throw new Error('Phải có ít nhất một giá cho size');
  }

  return optionRepository.updateOption(id, optionData);
};

const deleteOption = async (id) => {
  // Check if option exists
  const option = await optionRepository.findOptionById(id);
  if (!option) {
    throw new Error('Không tìm thấy tùy chọn');
  }

  return optionRepository.deleteOption(id);
};

const getOptionById = async (id) => {
  const option = await optionRepository.findOptionById(id);
  if (!option) {
    throw new Error('Không tìm thấy tùy chọn');
  }
  return option;
};

module.exports = {
  getAllOptions,
  getAllOptionsAdmin,
  getAllSizes,
  getAllOptionTypes,
  createOption,
  updateOption,
  deleteOption,
  getOptionById,
};
