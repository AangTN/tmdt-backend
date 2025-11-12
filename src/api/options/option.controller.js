const optionService = require('./option.service');

const getAllOptions = async (req, res) => {
  try {
    const options = await optionService.getAllOptions();
    res.status(200).json(options);
  } catch (error) {
    console.error('Error in getAllOptions controller:', error);
    res.status(500).json({ message: 'Lỗi server nội bộ' });
  }
};

module.exports = { getAllOptions };
