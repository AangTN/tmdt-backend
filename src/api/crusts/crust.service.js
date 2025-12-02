const crustRepository = require('./crust.repository');

const getAllCrusts = () => crustRepository.findAllCrusts();

const createCrust = async (data) => {
  if (!data.TenDeBanh || !data.TenDeBanh.trim()) {
    const e = new Error('Tên đế bánh là bắt buộc');
    e.status = 400;
    throw e;
  }
  return crustRepository.createCrust(data);
};

module.exports = { getAllCrusts, createCrust };
