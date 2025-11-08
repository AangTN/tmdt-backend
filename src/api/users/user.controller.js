const service = require('./user.service');

async function getUserProfile(req, res) {
  try {
    const maNguoiDung = Number(req.params.id);
    if (!maNguoiDung) {
      return res.status(400).json({ message: 'id không hợp lệ' });
    }
    const user = await service.getUserProfile(maNguoiDung);
    res.status(200).json({ data: user });
  } catch (err) {
    console.error('getUserProfile error:', err);
    const status = err.status || 500;
    res.status(status).json({ message: err.message || 'Lỗi server nội bộ' });
  }
}

async function updateUserProfile(req, res) {
  try {
    const updatedUser = await service.updateUserProfile(req.body);
    res.status(200).json({
      message: 'Cập nhật thông tin thành công',
      data: updatedUser,
    });
  } catch (err) {
    console.error('updateUserProfile error:', err);
    const status = err.status || 500;
    res.status(status).json({ message: err.message || 'Lỗi server nội bộ' });
  }
}

module.exports = {
  getUserProfile,
  updateUserProfile,
};
