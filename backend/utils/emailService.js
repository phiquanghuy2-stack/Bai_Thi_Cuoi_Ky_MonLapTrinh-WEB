const nodemailer = require('nodemailer');
const { calculateTieredElectricity } = require('./calcElectricity');

const createTransporter = async () => {
  const hasRealSmtp =
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.SMTP_USER !== 'your_email@gmail.com' &&
    process.env.SMTP_PASS !== 'your_app_password';

  if (hasRealSmtp) {
    return {
      transporter: nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      }),
      isTestAccount: false,
    };
  }

  const testAccount = await nodemailer.createTestAccount();
  return {
    transporter: nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    }),
    isTestAccount: true,
  };
};

const sendDebtReminderEmail = async ({ invoice, tenant, room }) => {
  const { kwhUsed } = calculateTieredElectricity(invoice.oldElec, invoice.newElec);
  const waterUsed = invoice.newWater - invoice.oldWater;

  const { transporter, isTestAccount } = await createTransporter();

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #FA5252, #E61E4D); color: #ffffff; padding: 24px; text-align: center;">
        <h2 style="margin: 0; font-size: 22px; letter-spacing: 1px;">HVA HOMESTAY</h2>
        <p style="margin: 4px 0 0; font-style: italic; font-size: 13px; opacity: 0.95;">“Hiên nhà đón gió ngàn phương, Về đây rũ mỏi, An tường giấc say.”</p>
        <p style="margin: 10px 0 0; font-weight: bold;">THÔNG BÁO NHẮC THANH TOÁN HÓA ĐƠN THÁNG ${invoice.month}/${invoice.year} - PHÒNG ${room.roomNumber}</p>
      </div>
      <div style="padding: 24px; color: #1e293b; line-height: 1.6;">
        <p>Xin chào <strong>${tenant.name}</strong>,</p>
        <p>Ban Quản Lý <strong>HVA HOMESTAY</strong> xin thông báo hóa đơn tiền phòng <strong>${room.roomNumber}</strong> kỳ <strong>Tháng ${invoice.month}/${invoice.year}</strong> của bạn hiện đang ở trạng thái <span style="color: #dc2626; font-weight: bold;">Chưa thanh toán</span>.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">
          <tr style="background-color: #f8fafc;">
            <td style="padding: 10px; border: 1px solid #e2e8f0;">Tiền thuê phòng</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: right; font-weight: bold;">${invoice.roomPrice.toLocaleString('vi-VN')} đ</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">Tiền điện (${invoice.oldElec} → ${invoice.newElec}: ${kwhUsed} kWh - Bậc thang)</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: right; font-weight: bold;">${invoice.elecAmount.toLocaleString('vi-VN')} đ</td>
          </tr>
          <tr style="background-color: #f8fafc;">
            <td style="padding: 10px; border: 1px solid #e2e8f0;">Tiền nước (${invoice.oldWater} → ${invoice.newWater}: ${waterUsed} m³)</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: right; font-weight: bold;">${invoice.waterAmount.toLocaleString('vi-VN')} đ</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">Phí dịch vụ chung</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: right; font-weight: bold;">${invoice.serviceFee.toLocaleString('vi-VN')} đ</td>
          </tr>
          <tr style="background-color: #fef2f2; color: #dc2626; font-size: 16px;">
            <td style="padding: 12px; border: 1px solid #fecaca; font-weight: bold;">TỔNG CỘNG CẦN THANH TOÁN</td>
            <td style="padding: 12px; border: 1px solid #fecaca; text-align: right; font-weight: bold;">${invoice.totalAmount.toLocaleString('vi-VN')} VNĐ</td>
          </tr>
        </table>

        <p>Vui lòng hoàn tất thanh toán sớm để tránh gián đoạn dịch vụ. Nếu bạn đã thanh toán, vui lòng bỏ qua email này.</p>
        <p style="margin-top: 20px; font-size: 13px; color: #64748b;">Trân trọng,<br/><strong>Ban Quản Lý HVA HOMESTAY</strong></p>
      </div>
    </div>
  `;

  const info = await transporter.sendMail({
    from: process.env.FROM_EMAIL || '"HVA HOMESTAY" <no-reply@hvahomestay.vn>',
    to: tenant.email,
    subject: `[HVA HOMESTAY] Nhắc thanh toán hóa đơn Phòng ${room.roomNumber} - Tháng ${invoice.month}/${invoice.year}`,
    html: htmlContent,
  });

  const previewUrl = isTestAccount ? nodemailer.getTestMessageUrl(info) : null;
  return {
    messageId: info.messageId,
    previewUrl,
    recipient: tenant.email,
  };
};

module.exports = { sendDebtReminderEmail };
