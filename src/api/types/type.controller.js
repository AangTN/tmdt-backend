const typeService = require('./type.service');

const getTypes = async (req, res) => {
  try {
    const types = await typeService.getAllTypes();
    res.status(200).json(types);
  } catch (error) {
    console.error('Error in getTypes controller:', error);
    res.status(500).json({ message: 'Lỗi server nội bộ' });
  }
};

module.exports = { getTypes };
