const optionRepository = require('./option.repository');

const getAllOptions = async () => {
  return optionRepository.findAllOptions();
};

module.exports = { getAllOptions };
