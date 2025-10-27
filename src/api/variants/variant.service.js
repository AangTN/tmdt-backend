const repo = require('./variant.repository');

const getAllVariants = () => repo.findAllVariants();
const getAllOptionPrices = () => repo.findAllOptionPrices();

module.exports = { getAllVariants, getAllOptionPrices };
