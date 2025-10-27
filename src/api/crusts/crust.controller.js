const crustService = require('./crust.service');

const getCrusts = async (req, res) => {
  try {
    const crusts = await crustService.getAllCrusts();
    res.status(200).json(crusts);
  } catch (error) {
    console.error('Error in getCrusts controller:', error);
    res.status(500).json({ message: 'Lỗi server nội bộ' });
  }
};

module.exports = { getCrusts };
