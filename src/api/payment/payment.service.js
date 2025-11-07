const orderRepo = require('../order/order.repository');

async function handleVNPayReturn(queryParams) {
  const orderId = queryParams.vnp_TxnRef;
  if (!orderId) {
    const e = new Error('Không tìm thấy mã đơn hàng');
    e.status = 400;
    throw e;
  }
  
  // Kiểm tra đơn hàng có tồn tại không
  const order = await orderRepo.findOrderByIdDetailed(orderId);
  if (!order) {
    const e = new Error('Không tìm thấy đơn hàng');
    e.status = 404;
    throw e;
  }
  
  // Kiểm tra transactionStatus
  // vnp_TransactionStatus = '00' => Thành công
  const transactionStatus = queryParams.vnp_TransactionStatus;
  const isSuccess = transactionStatus === '00';
  
  let paymentStatus = 'Chưa thanh toán';
  if (isSuccess) {
    paymentStatus = 'Đã thanh toán';
  } else {
    paymentStatus = 'Thanh toán thất bại';
  }
  
  // Cập nhật trạng thái thanh toán
  await orderRepo.updatePaymentStatus(orderId, {
    trangThai: paymentStatus,
    maGiaoDich: queryParams.vnp_TransactionNo || queryParams.vnp_BankTranNo,
  });
  
  return {
    success: isSuccess,
    orderId,
    responseCode: queryParams.vnp_ResponseCode,
    transactionStatus: queryParams.vnp_TransactionStatus,
    message: isSuccess ? 'Thanh toán thành công' : 'Thanh toán thất bại',
    amount: queryParams.vnp_Amount ? parseInt(queryParams.vnp_Amount) / 100 : 0,
    bankCode: queryParams.vnp_BankCode,
    transactionNo: queryParams.vnp_TransactionNo,
    payDate: queryParams.vnp_PayDate,
  };
}

module.exports = {
  handleVNPayReturn,
};
