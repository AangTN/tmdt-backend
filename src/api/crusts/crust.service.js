const crustRepository = require('./crust.repository');

const getAllCrusts = () => crustRepository.findAllCrusts();

module.exports = { getAllCrusts };
