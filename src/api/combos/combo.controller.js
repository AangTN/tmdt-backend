const comboService = require('./combo.service');

const getCombos = async (req, res) => {
  try {
    const combos = await comboService.getAllActiveCombos();
    return res.status(200).json(combos);
  } catch (err) {
    console.error('Error getCombos:', err);
    return res.status(500).json({ message: 'Lỗi server nội bộ' });
  }
};

const getComboById = async (req, res) => {
  try {
    const id = req.params.id;
    const combo = await comboService.getComboDetail(id);
    if (!combo) return res.status(404).json({ message: 'Không tìm thấy combo' });
    return res.status(200).json(combo);
  } catch (err) {
    console.error('Error getComboById:', err);
    return res.status(500).json({ message: 'Lỗi server nội bộ' });
  }
};

module.exports = { getCombos, getComboById };