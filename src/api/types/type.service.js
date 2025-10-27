const typeRepository = require('./type.repository');

const getAllTypes = () => typeRepository.findAllTypes();

module.exports = { getAllTypes };
