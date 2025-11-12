const sizeRepository = require('./size.repository');

const getAllSizes = async () => {
  return sizeRepository.findAllSizes();
};

module.exports = { getAllSizes };
