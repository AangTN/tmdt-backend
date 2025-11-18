const nodemailer = require('nodemailer');

// Create transporter with Gmail using env vars
const EMAIL_USER = process.env.EMAIL_USER || process.env.EMAIL || 'secretpizza04@gmail.com';
const EMAIL_PASS = process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD || process.env.SMTP_PASS || '';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

/**
 * Send voucher gift email
 * @param {Object} params - Email parameters
 * @param {string} params.to - Recipient email
 * @param {string} params.recipientName - Recipient name
 * @param {string} params.voucherCode - Voucher code
 * @param {string} params.voucherDescription - Voucher description
 * @param {string} params.discount - Discount value (formatted)
 * @param {string} params.minOrder - Minimum order value (formatted)
 * @param {string} params.expiryDate - Expiry date (formatted)
 * @param {string} params.message - Custom message from sender
 */
async function sendVoucherGiftEmail({ to, recipientName, voucherCode, voucherDescription, discount, minOrder, expiryDate, message }) {
  const mailOptions = {
    from: `"Secret Pizza 🍕" <${EMAIL_USER}>`,
    to: to,
    subject: `🎁 Bạn nhận được voucher giảm giá từ Secret Pizza!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          }
          .content {
            background: white;
            border-radius: 10px;
            padding: 30px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #667eea;
            margin: 0;
            font-size: 28px;
          }
          .gift-icon {
            font-size: 60px;
            margin-bottom: 20px;
          }
          .voucher-box {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            border-radius: 10px;
            padding: 25px;
            text-align: center;
            margin: 25px 0;
            color: white;
          }
          .voucher-code {
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 3px;
            background: white;
            color: #f5576c;
            padding: 15px 25px;
            border-radius: 8px;
            display: inline-block;
            margin: 15px 0;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
          }
          .voucher-details {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #dee2e6;
          }
          .detail-row:last-child {
            border-bottom: none;
          }
          .detail-label {
            font-weight: 600;
            color: #666;
          }
          .detail-value {
            color: #333;
            font-weight: 500;
          }
          .message-box {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
          }
          .message-box p {
            margin: 0;
            color: #856404;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #f0f0f0;
            color: #666;
            font-size: 14px;
          }
          .cta-button {
            display: inline-block;
            background: #ffffff;
            color: #f5576c;
            padding: 12px 28px;
            text-decoration: none;
            border-radius: 25px;
            font-weight: 700;
            margin: 20px 0;
            box-shadow: 0 6px 18px rgba(0,0,0,0.12);
            border: 2px solid rgba(245,87,108,0.12);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="content">
            <div class="header">
              <div class="gift-icon">🎁</div>
              <h1>Bạn Nhận Được Quà Tặng!</h1>
              <p style="color: #666; font-size: 16px;">Xin chào <strong>${recipientName}</strong>,</p>
            </div>

            ${message ? `
            <div class="message-box">
              <p><strong>💌 Lời nhắn:</strong></p>
              <p style="margin-top: 10px;">${message}</p>
            </div>
            ` : ''}

            <p style="text-align: center; font-size: 16px; color: #555;">
              Chúng tôi rất vui được gửi đến bạn voucher giảm giá đặc biệt từ <strong>Secret Pizza</strong>!
            </p>

            <div class="voucher-box">
              <p style="margin: 0; font-size: 18px; opacity: 0.9;">MÃ GIẢM GIÁ</p>
              <div class="voucher-code">${voucherCode}</div>
              <p style="margin: 0; font-size: 16px; opacity: 0.9;">${voucherDescription}</p>
            </div>

            <div class="voucher-details">
              <div class="detail-row">
                <span class="detail-label">🎉 Giảm giá:</span>
                <span class="detail-value">${discount}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">🛒 Đơn tối thiểu:</span>
                <span class="detail-value">${minOrder}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">⏰ Hạn sử dụng:</span>
                <span class="detail-value">${expiryDate}</span>
              </div>
            </div>

            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'https://secretpizza.com'}" class="cta-button">🍕 Đặt Hàng Ngay</a>
            </div>

            <div class="footer">
              <p><strong>Secret Pizza</strong></p>
              <p>Cảm ơn bạn đã tin tưởng và ủng hộ!</p>
              <p style="font-size: 12px; color: #999; margin-top: 15px;">
                Email này được gửi tự động, vui lòng không trả lời.
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

module.exports = {
  sendVoucherGiftEmail
};
