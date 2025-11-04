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

module.exports = { listVouchers, getVoucher };
