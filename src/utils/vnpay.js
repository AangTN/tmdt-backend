const crypto = require('crypto');
const qs = require('qs'); // npm install qs

function formatDate(date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  const hours = `${date.getHours()}`.padStart(2, '0');
  const minutes = `${date.getMinutes()}`.padStart(2, '0');
  const seconds = `${date.getSeconds()}`.padStart(2, '0');
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

function buildConfig() {
  const tmnCode = process.env.VNP_TMNCODE || 'J8L2W6TA';
  const hashSecret = process.env.VNP_HASH_SECRET || '3U03B9N9TEMWT8BQPUPB2U4ONLUOLZ53';
  const vnpUrl = process.env.VNP_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
  const apiUrl = process.env.VNP_API || 'https://sandbox.vnpayment.vn/merchant_webapi/api/transaction';
  const returnUrl = process.env.VNP_RETURN_URL || 'http://localhost:3001/api/payment/vnpay-return';

  if (!tmnCode || !hashSecret || !vnpUrl || !returnUrl) {
    throw new Error('Missing VNPay configuration');
  }

  return { tmnCode, hashSecret, vnpUrl, apiUrl, returnUrl };
}

/**
 * Chuẩn hóa params giống file demo của VNPay
 */
function sortAndEncodeVNPayParams(obj) {
  const sorted = {};
  const keys = Object.keys(obj).filter((k) => obj[k] !== undefined && obj[k] !== null && obj[k] !== '');
  keys.sort();
  for (const key of keys) {
    // encode key + value giống demo của VNPay
    sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, '+');
  }
  return sorted;
}

function createPaymentUrl(options) {
  const cfg = buildConfig();

  const amount = Number(options.amount || 0);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Amount must be a positive number to create VNPay payment url');
  }

  const orderId = options.orderId || Date.now();
  const orderInfo = options.orderInfo || `Thanh toán đơn hàng #${orderId}`;
  const now = new Date();
  const createDate = formatDate(now);
  const expireDate = formatDate(new Date(now.getTime() + (options.expireMinutes || 15) * 60 * 1000));
  const txnRef = options.txnRef || `${orderId}`;

  const params = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: cfg.tmnCode,
    vnp_Locale: options.locale || 'vn',
    vnp_CurrCode: 'VND',
    vnp_TxnRef: txnRef,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: options.orderType || 'other',
    vnp_Amount: Math.round(amount * 100),
    vnp_ReturnUrl: options.returnUrl || cfg.returnUrl,
    vnp_IpAddr: options.ipAddr || '127.0.0.1',
    vnp_CreateDate: createDate,
    vnp_ExpireDate: expireDate,
  };

  if (options.bankCode) {
    params.vnp_BankCode = options.bankCode;
  }

  // ✅ Sắp xếp & encode theo chuẩn VNPay (rất quan trọng)
  const sortedParams = sortAndEncodeVNPayParams(params);

  // ✅ Tạo chuỗi ký: "key=value&key=value..." không encode thêm
  const signData = Object.keys(sortedParams)
    .map((key) => `${key}=${sortedParams[key]}`)
    .join('&');

  // ✅ Ký bằng SHA512
  const hmac = crypto.createHmac('sha512', cfg.hashSecret);
  const secureHash = hmac.update(Buffer.from(signData, 'utf8')).digest('hex');

  // ✅ Ghép URL thanh toán
  const paymentUrl = `${cfg.vnpUrl}?${signData}&vnp_SecureHashType=SHA512&vnp_SecureHash=${secureHash}`;

  return {
    url: paymentUrl,
    params: sortedParams,
    secureHash,
    signData,
  };
}

/**
 * Verify VNPay callback signature
 */
function verifyReturnUrl(queryParams) {
  const cfg = buildConfig();
  
  // Lấy secureHash từ query params
  const vnp_SecureHash = queryParams.vnp_SecureHash;
  
  // Loại bỏ các trường không cần thiết
  const paramsToVerify = { ...queryParams };
  delete paramsToVerify.vnp_SecureHash;
  delete paramsToVerify.vnp_SecureHashType;
  
  // ✅ Sắp xếp & encode lại params giống lúc tạo url (QUAN TRỌNG)
  // Express đã decode params, nên cần encode lại để khớp với chuỗi ký gốc của VNPay
  const sortedParams = sortAndEncodeVNPayParams(paramsToVerify);
  
  const signData = Object.keys(sortedParams)
    .map((key) => `${key}=${sortedParams[key]}`)
    .join('&');
  
  // Tính toán signature
  const hmac = crypto.createHmac('sha512', cfg.hashSecret);
  const calculatedHash = hmac.update(Buffer.from(signData, 'utf8')).digest('hex');
  
  // So sánh signature
  const isValid = calculatedHash === vnp_SecureHash;
  
  return {
    isValid,
    responseCode: queryParams.vnp_ResponseCode,
    transactionStatus: queryParams.vnp_TransactionStatus,
    orderId: queryParams.vnp_TxnRef,
    amount: queryParams.vnp_Amount ? parseInt(queryParams.vnp_Amount) / 100 : 0,
    bankCode: queryParams.vnp_BankCode,
    bankTranNo: queryParams.vnp_BankTranNo,
    transactionNo: queryParams.vnp_TransactionNo,
    payDate: queryParams.vnp_PayDate,
    orderInfo: queryParams.vnp_OrderInfo,
  };
}

module.exports = { createPaymentUrl, verifyReturnUrl };
