const PDFDocument = require('pdfkit');
const fs = require('fs');
const { calculateTieredElectricity } = require('./calcElectricity');

const removeAccents = (str = '') => {
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

const formatCurrency = (num) => {
  return `${Number(num || 0).toLocaleString('vi-VN')} VNĐ`;
};

const generateInvoicePDF = (invoice, res) => {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  const normalFontPath = 'C:\\Windows\\Fonts\\arial.ttf';
  const boldFontPath = 'C:\\Windows\\Fonts\\arialbd.ttf';
  const hasVietnameseFont = fs.existsSync(normalFontPath) && fs.existsSync(boldFontPath);

  if (hasVietnameseFont) {
    doc.registerFont('Regular', normalFontPath);
    doc.registerFont('Bold', boldFontPath);
  } else {
    doc.registerFont('Regular', 'Helvetica');
    doc.registerFont('Bold', 'Helvetica-Bold');
  }

  const txt = (str) => (hasVietnameseFont ? String(str) : removeAccents(str));

  const roomNumber = invoice.room?.roomNumber || 'N/A';
  const fileName = `HVA_Homestay_HoaDon_${roomNumber}_T${invoice.month}_${invoice.year}.pdf`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

  doc.pipe(res);

  // Header HVA HOMESTAY
  doc
    .font('Bold')
    .fontSize(20)
    .fillColor('#FA5252')
    .text(txt('HVA HOMESTAY - HỆ THỐNG QUẢN LÝ PHÒNG & CĂN HỘ'), { align: 'center' });

  doc
    .font('Regular')
    .fontSize(10)
    .fillColor('#475569')
    .text(txt('“Hiên nhà đón gió ngàn phương, Về đây rũ mỏi, An tường giấc say.” | Hotline: 0988.888.888'), {
      align: 'center',
    });

  doc.moveDown(1.2);
  doc
    .font('Bold')
    .fontSize(16)
    .fillColor('#0f172a')
    .text(txt(`HÓA ĐƠN TIỀN PHÒNG THÁNG ${invoice.month}/${invoice.year}`), {
      align: 'center',
    });

  doc.moveDown(1);

  const infoTop = doc.y;
  doc
    .font('Bold')
    .fontSize(11)
    .fillColor('#1e293b')
    .text(txt(`Phòng: ${roomNumber}`), 50, infoTop);

  doc
    .font('Regular')
    .fontSize(11)
    .text(txt(`Người thuê: ${invoice.tenant?.name || 'Khách thuê phòng'}`), 50, infoTop + 18)
    .text(txt(`Số điện thoại: ${invoice.tenant?.phone || 'N/A'}`), 50, infoTop + 36);

  doc
    .font('Bold')
    .text(txt(`Trạng thái: ${invoice.status}`), 330, infoTop, { align: 'right' })
    .font('Regular')
    .text(
      txt(`Ngày lập: ${new Date(invoice.createdAt).toLocaleDateString('vi-VN')}`),
      330,
      infoTop + 18,
      { align: 'right' }
    )
    .text(
      txt(`Mã HĐ: #${invoice._id.toString().slice(-8).toUpperCase()}`),
      330,
      infoTop + 36,
      { align: 'right' }
    );

  doc.moveDown(2.5);

  const drawLine = (y) => {
    doc
      .strokeColor('#cbd5e1')
      .lineWidth(1)
      .moveTo(50, y)
      .lineTo(545, y)
      .stroke();
  };

  drawLine(doc.y);
  doc.moveDown(0.8);

  doc.font('Bold').fontSize(12).fillColor('#FA5252').text(txt('1. TỔNG HỢP CÁC KHOẢN PHÍ'), 50);
  doc.moveDown(0.5);

  const tableTop = doc.y;
  doc.font('Bold').fontSize(10).fillColor('#334155');
  doc.text(txt('Khoản mục'), 50, tableTop);
  doc.text(txt('Chi tiết chỉ số'), 200, tableTop);
  doc.text(txt('Thành tiền'), 420, tableTop, { width: 125, align: 'right' });

  drawLine(tableTop + 18);

  let rowY = tableTop + 26;
  const addRow = (title, detail, amount) => {
    doc.font('Bold').fontSize(10).fillColor('#0f172a').text(txt(title), 50, rowY);
    doc.font('Regular').fontSize(10).fillColor('#475569').text(txt(detail), 200, rowY);
    doc
      .font('Bold')
      .fontSize(10)
      .fillColor('#0f172a')
      .text(txt(formatCurrency(amount)), 420, rowY, { width: 125, align: 'right' });
    rowY += 24;
  };

  const elecUsed = invoice.newElec - invoice.oldElec;
  const waterUsed = invoice.newWater - invoice.oldWater;

  addRow('Tiền thuê phòng cố định', `Tháng ${invoice.month}/${invoice.year}`, invoice.roomPrice);
  addRow(
    'Tiền điện (Bậc thang)',
    `Cũ: ${invoice.oldElec} - Mới: ${invoice.newElec} (${elecUsed} kWh)`,
    invoice.elecAmount
  );
  addRow(
    'Tiền nước sinh hoạt',
    `Cũ: ${invoice.oldWater} - Mới: ${invoice.newWater} (${waterUsed} m3)`,
    invoice.waterAmount
  );
  addRow('Phí dịch vụ (Rác, Wifi, Vệ sinh)', 'Trọn gói hàng tháng', invoice.serviceFee);

  drawLine(rowY);
  rowY += 12;

  doc
    .font('Bold')
    .fontSize(13)
    .fillColor('#dc2626')
    .text(txt('TỔNG CỘNG THANH TOÁN:'), 50, rowY)
    .text(txt(formatCurrency(invoice.totalAmount)), 370, rowY, {
      width: 175,
      align: 'right',
    });

  doc.y = rowY + 35;

  const { breakdown } = calculateTieredElectricity(invoice.oldElec, invoice.newElec);
  doc
    .font('Bold')
    .fontSize(12)
    .fillColor('#FA5252')
    .text(txt('2. CHI TIẾT TÍNH TIỀN ĐIỆN THEO BẬC THANG'), 50);
  doc.moveDown(0.5);

  const tierHeaderY = doc.y;
  doc.font('Bold').fontSize(10).fillColor('#334155');
  doc.text(txt('Bậc thang'), 50, tierHeaderY);
  doc.text(txt('Sản lượng (kWh)'), 230, tierHeaderY);
  doc.text(txt('Đơn giá'), 340, tierHeaderY);
  doc.text(txt('Thành tiền'), 430, tierHeaderY, { width: 115, align: 'right' });
  drawLine(tierHeaderY + 16);

  let tierY = tierHeaderY + 24;
  breakdown.forEach((b) => {
    doc.font('Regular').fontSize(9.5).fillColor('#1e293b');
    doc.text(txt(b.label), 50, tierY);
    doc.text(`${b.kwh} kWh`, 230, tierY);
    doc.text(txt(`${b.unitPrice.toLocaleString('vi-VN')} đ`), 340, tierY);
    doc.text(txt(formatCurrency(b.amount)), 430, tierY, { width: 115, align: 'right' });
    tierY += 20;
  });

  drawLine(tierY + 4);

  const footerY = tierY + 35;
  doc
    .font('Regular')
    .fontSize(10)
    .fillColor('#475569')
    .text(
      txt('Quý cư dân vui lòng thanh toán đúng hạn trước ngày 05 hàng tháng. Trân trọng cảm ơn!'),
      50,
      footerY
    );

  doc
    .font('Bold')
    .fontSize(11)
    .fillColor('#0f172a')
    .text(txt('Người thuê phòng'), 80, footerY + 30)
    .text(txt('Đại diện HVA HOMESTAY'), 370, footerY + 30);

  doc.end();
};

module.exports = { generateInvoicePDF };
