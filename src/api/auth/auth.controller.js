const service = require('./auth.service');

async function register(req, res) {
  try {
    const { email, hoTen, matKhau, soDienThoai } = req.body;
    const user = await service.register({ email, hoTen, matKhau, soDienThoai });
    res.status(201).json({ message: 'Đăng ký thành công', user });
  } catch (err) {
    console.error('register error:', err);
    const status = err.status || 500;
    res.status(status).json({ message: err.message || 'Lỗi server nội bộ' });
  }
}

async function login(req, res) {
  try {
    const { email, matKhau } = req.body;
    const user = await service.login({ email, matKhau });
    res.status(200).json({ message: 'Đăng nhập thành công', user });
  } catch (err) {
    console.error('login error:', err);
    const status = err.status || 500;
    res.status(status).json({ message: err.message || 'Lỗi server nội bộ' });
  }
}

module.exports = {
  register,
  login,
};
