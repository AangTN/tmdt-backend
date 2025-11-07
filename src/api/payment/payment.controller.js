const service = require('./payment.service');

async function vnpayReturn(req, res) {
  try {
    const result = await service.handleVNPayReturn(req.query);
    
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    if (result.success) {
      // Redirect về trang thành công
      res.redirect(`${frontendUrl}/order-success?orderId=${result.orderId}`);
    } else {
      // Redirect về trang thất bại với lý do
      const message = encodeURIComponent(result.message || 'Thanh toán thất bại');
      res.redirect(`${frontendUrl}/payment-failed?orderId=${result.orderId}&message=${message}`);
    }
  } catch (err) {
    console.error('VNPay return error:', err);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const message = encodeURIComponent(err.message || 'Lỗi xử lý thanh toán');
    res.redirect(`${frontendUrl}/payment-failed?message=${message}`);
  }
}

module.exports = {
  vnpayReturn,
};
