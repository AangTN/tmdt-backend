const branchRepository = require('./branch.repository');

const getAllBranches = () => branchRepository.findAllBranches();

module.exports = { getAllBranches }; 
