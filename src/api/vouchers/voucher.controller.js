const service = require('./voucher.service');

async function listVouchers(req, res) {
  try {
    const data = await service.getAllVouchers();
    res.status(200).json({ data });
  } catch (err) {
    console.error('listVouchers error', err);
    res.status(500).json({ message: 'Lỗi server nội bộ' });
  }
}

async function getVoucher(req, res) {
  try {
    const code = req.params.code;
    if (!code) return res.status(400).json({ message: 'Thiếu mã voucher' });
    const v = await service.getVoucherByCode(code);
    if (!v) return res.status(404).json({ message: 'Voucher không tồn tại' });
    res.status(200).json({ data: v });
  } catch (err) {
    console.error('getVoucher error', err);
    res.status(500).json({ message: 'Lỗi server nội bộ' });
  }
}

async function createVoucher(req, res) {
  try {
    const created = await service.createVoucher(req.body);
    res.status(201).json({ message: 'Tạo voucher thành công', data: created });
  } catch (err) {
    console.error('createVoucher error', err);
    const status = err.status || 500;
    res.status(status).json({ message: err.message || 'Lỗi server nội bộ' });
  }
}

async function updateVoucher(req, res) {
  try {
    const code = req.params.code;
    const updated = await service.updateVoucher(code, req.body);
    res.status(200).json({ message: 'Cập nhật voucher thành công', data: updated });
  } catch (err) {
    console.error('updateVoucher error', err);
    const status = err.status || 500;
    res.status(status).json({ message: err.message || 'Lỗi server nội bộ' });
  }
}

async function toggleVoucherStatus(req, res) {
  try {
    const code = req.params.code;
    const { TrangThai } = req.body;
    const updated = await service.toggleVoucherStatus(code, TrangThai);
    res.status(200).json({ message: 'Thay đổi trạng thái thành công', data: updated });
  } catch (err) {
    console.error('toggleVoucherStatus error', err);
    const status = err.status || 500;
    res.status(status).json({ message: err.message || 'Lỗi server nội bộ' });
  }
}

module.exports = { listVouchers, getVoucher, createVoucher, updateVoucher, toggleVoucherStatus };
