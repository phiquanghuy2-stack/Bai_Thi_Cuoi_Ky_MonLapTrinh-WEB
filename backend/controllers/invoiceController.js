const Invoice = require('../models/Invoice');
const Room = require('../models/Room');
const Contract = require('../models/Contract');
const AppError = require('../utils/AppError');
const {
  calculateTieredElectricity,
  calculateInvoiceAmounts,
} = require('../utils/calcElectricity');
const { generateInvoicePDF } = require('../utils/pdfGenerator');
const { sendDebtReminderEmail } = require('../utils/emailService');

// Helper kiểm tra quyền sở hữu hóa đơn của Tenant (Trả về true nếu hợp lệ, false nếu 403)
const verifyTenantInvoiceAccess = async (user, invoice) => {
  if (user.role === 'admin') return true;

  const invoiceTenantId = invoice.tenant?._id
    ? invoice.tenant._id.toString()
    : invoice.tenant?.toString();

  if (invoiceTenantId && invoiceTenantId === user._id.toString()) {
    return true;
  }

  const invoiceRoomId = invoice.room?._id
    ? invoice.room._id.toString()
    : invoice.room?.toString();

  // Kiểm tra xem người thuê có hợp đồng hiệu lực tại phòng đó không
  const activeContract = await Contract.findOne({
    tenant: user._id,
    room: invoiceRoomId,
    status: 'Hiệu lực',
  });

  return Boolean(activeContract);
};

// @desc    Lấy danh sách hóa đơn (Hỗ trợ lọc tháng/năm/status/room, phân trang Server-side)
// @route   GET /api/invoices
// @access  Private (Admin, Tenant)
const getInvoices = async (req, res, next) => {
  try {
    const { month, year, status, room, search = '', page = 1, limit = 10, all } = req.query;

    const query = {};

    // Nếu là Tenant: chỉ lấy hóa đơn gắn với Tenant hoặc thuộc phòng Tenant đang thuê
    if (req.user.role === 'tenant') {
      const tenantContracts = await Contract.find({
        tenant: req.user._id,
        status: 'Hiệu lực',
      }).select('room');

      const allowedRoomIds = tenantContracts.map((c) => c.room);
      query.$or = [
        { tenant: req.user._id },
        { room: { $in: allowedRoomIds } },
      ];
    }

    if (month) query.month = Number(month);
    if (year) query.year = Number(year);

    if (status) {
      const statusList = status.split(',').map((s) => s.trim()).filter(Boolean);
      query.status = statusList.length > 1 ? { $in: statusList } : statusList[0];
    }

    if (room) {
      query.room = room;
    }

    // Tìm kiếm theo số phòng ($regex)
    if (search.trim()) {
      const matchedRooms = await Room.find({
        roomNumber: { $regex: search.trim(), $options: 'i' },
      }).select('_id');
      const matchedRoomIds = matchedRooms.map((r) => r._id);

      if (query.room) {
        query.room = { $in: matchedRoomIds.filter((id) => id.toString() === query.room.toString()) };
      } else {
        query.room = { $in: matchedRoomIds };
      }
    }

    if (all === 'true') {
      const invoices = await Invoice.find(query)
        .populate('room', 'roomNumber price area status')
        .populate('tenant', 'name email phone')
        .sort({ year: -1, month: -1, createdAt: -1 })
        .lean();

      const enriched = invoices.map((inv) => ({
        ...inv,
        elecBreakdown: calculateTieredElectricity(inv.oldElec, inv.newElec).breakdown,
      }));

      return res.status(200).json({
        success: true,
        data: enriched,
      });
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNum - 1) * limitNum;

    const [invoices, total] = await Promise.all([
      Invoice.find(query)
        .populate('room', 'roomNumber price area status')
        .populate('tenant', 'name email phone')
        .sort({ year: -1, month: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Invoice.countDocuments(query),
    ]);

    const enriched = invoices.map((inv) => ({
      ...inv,
      elecBreakdown: calculateTieredElectricity(inv.oldElec, inv.newElec).breakdown,
    }));

    res.status(200).json({
      success: true,
      data: enriched,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Lấy dữ liệu Bảng nhập chỉ số điện nước theo Tháng/Năm cho tất cả các phòng
// @route   GET /api/invoices/sheet?month=11&year=2026
// @access  Private (Admin)
const getUtilitySheet = async (req, res, next) => {
  try {
    const now = new Date();
    const month = Number(req.query.month) || now.getMonth() + 1;
    const year = Number(req.query.year) || now.getFullYear();

    const [rooms, activeContracts, existingInvoices] = await Promise.all([
      Room.find().sort({ roomNumber: 1 }).lean(),
      Contract.find({ status: 'Hiệu lực' })
        .populate('tenant', 'name email phone')
        .lean(),
      Invoice.find({ month, year })
        .populate('tenant', 'name email phone')
        .lean(),
    ]);

    const contractByRoom = {};
    activeContracts.forEach((c) => {
      contractByRoom[c.room.toString()] = c;
    });

    const invoiceByRoom = {};
    existingInvoices.forEach((inv) => {
      invoiceByRoom[inv.room.toString()] = inv;
    });

    const rows = rooms.map((room) => {
      const rid = room._id.toString();
      const contract = contractByRoom[rid] || null;
      const invoice = invoiceByRoom[rid] || null;

      return {
        roomId: room._id,
        roomNumber: room.roomNumber,
        roomStatus: room.status,
        roomPrice: invoice ? invoice.roomPrice : room.price,
        tenant: invoice?.tenant || contract?.tenant || null,
        oldElec: invoice ? invoice.oldElec : room.lastElecIndex || 0,
        newElec: invoice ? invoice.newElec : room.lastElecIndex || 0,
        oldWater: invoice ? invoice.oldWater : room.lastWaterIndex || 0,
        newWater: invoice ? invoice.newWater : room.lastWaterIndex || 0,
        serviceFee: invoice
          ? invoice.serviceFee
          : Number(process.env.DEFAULT_SERVICE_FEE) || 100000,
        existingInvoice: invoice
          ? {
              _id: invoice._id,
              totalAmount: invoice.totalAmount,
              elecAmount: invoice.elecAmount,
              waterAmount: invoice.waterAmount,
              status: invoice.status,
            }
          : null,
      };
    });

    res.status(200).json({
      success: true,
      month,
      year,
      data: rows,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Xem chi tiết 1 hóa đơn (Bắt buộc trả 403 Forbidden nếu Tenant truyền ID hóa đơn phòng khác)
// @route   GET /api/invoices/:id
// @access  Private (Admin, Tenant)
const getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('room', 'roomNumber price area status')
      .populate('tenant', 'name email phone')
      .lean();

    if (!invoice) {
      return next(new AppError('Không tìm thấy hóa đơn!', 404));
    }

    // PHÂN QUYỀN KHẮT KHE THEO ĐẶC TẢ: Tenant truyền ID hóa đơn phòng khác -> 403 Forbidden
    const hasAccess = await verifyTenantInvoiceAccess(req.user, invoice);
    if (!hasAccess) {
      return next(
        new AppError(
          'Truy cập bị từ chối (403 Forbidden): Bạn không có quyền xem hóa đơn của phòng khác!',
          403
        )
      );
    }

    const { kwhUsed, breakdown } = calculateTieredElectricity(invoice.oldElec, invoice.newElec);

    res.status(200).json({
      success: true,
      data: {
        ...invoice,
        kwhUsed,
        waterUsed: invoice.newWater - invoice.oldWater,
        elecBreakdown: breakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin lập hóa đơn mới (Tính điện bậc thang Server-side + Khóa trùng lặp 1 phòng/tháng/năm)
// @route   POST /api/invoices
// @access  Private (Admin)
const createInvoice = async (req, res, next) => {
  try {
    const {
      room,
      month,
      year,
      oldElec,
      newElec,
      oldWater,
      newWater,
      serviceFee,
    } = req.body;

    if (
      !room ||
      month === undefined ||
      year === undefined ||
      oldElec === undefined ||
      newElec === undefined ||
      oldWater === undefined ||
      newWater === undefined
    ) {
      return next(
        new AppError('Vui lòng nhập đầy đủ phòng, tháng, năm và chỉ số điện/nước cũ - mới!', 400)
      );
    }

    const numOldElec = Number(oldElec);
    const numNewElec = Number(newElec);
    const numOldWater = Number(oldWater);
    const numNewWater = Number(newWater);

    // Kiểm tra chỉ số mới >= chỉ số cũ ở phía Server
    if (numNewElec < numOldElec) {
      return next(
        new AppError(
          `Chỉ số điện mới (${numNewElec}) không được nhỏ hơn chỉ số điện cũ (${numOldElec})!`,
          400
        )
      );
    }

    if (numNewWater < numOldWater) {
      return next(
        new AppError(
          `Chỉ số nước mới (${numNewWater}) không được nhỏ hơn chỉ số nước cũ (${numOldWater})!`,
          400
        )
      );
    }

    const roomDoc = await Room.findById(room);
    if (!roomDoc) {
      return next(new AppError('Không tìm thấy phòng trọ!', 404));
    }

    // KHÓA TRÙNG LẶP: Kiểm tra 1 phòng chỉ được có 1 hóa đơn trong 1 tháng/năm
    const duplicate = await Invoice.findOne({
      room: roomDoc._id,
      month: Number(month),
      year: Number(year),
    });

    if (duplicate) {
      return next(
        new AppError(
          `Phòng ${roomDoc.roomNumber} đã có hóa đơn trong tháng ${month}/${year}. Mỗi phòng chỉ được lập 1 hóa đơn/tháng!`,
          409
        )
      );
    }

    // Tìm người thuê hiện tại của phòng (nếu có)
    const activeContract = await Contract.findOne({
      room: roomDoc._id,
      status: 'Hiệu lực',
    });

    // TÍNH TOÁN SERVER-SIDE: Tiền phòng + Tiền điện bậc thang + Tiền nước + Phí dịch vụ
    const calc = calculateInvoiceAmounts({
      roomPrice: roomDoc.price,
      oldElec: numOldElec,
      newElec: numNewElec,
      oldWater: numOldWater,
      newWater: numNewWater,
      serviceFee:
        serviceFee !== undefined
          ? Number(serviceFee)
          : Number(process.env.DEFAULT_SERVICE_FEE) || 100000,
    });

    const invoice = await Invoice.create({
      room: roomDoc._id,
      tenant: activeContract ? activeContract.tenant : null,
      month: Number(month),
      year: Number(year),
      oldElec: numOldElec,
      newElec: numNewElec,
      oldWater: numOldWater,
      newWater: numNewWater,
      roomPrice: calc.roomPrice,
      elecAmount: calc.elecAmount,
      waterAmount: calc.waterAmount,
      serviceFee: calc.serviceFee,
      totalAmount: calc.totalAmount,
      status: 'Chưa thanh toán',
    });

    // Cập nhật chỉ số điện/nước mới nhất vào Room để gợi ý cho tháng tiếp theo
    roomDoc.lastElecIndex = Math.max(roomDoc.lastElecIndex || 0, numNewElec);
    roomDoc.lastWaterIndex = Math.max(roomDoc.lastWaterIndex || 0, numNewWater);
    await roomDoc.save();

    const populated = await Invoice.findById(invoice._id)
      .populate('room', 'roomNumber price area status')
      .populate('tenant', 'name email phone')
      .lean();

    res.status(201).json({
      success: true,
      message: `Lập hóa đơn phòng ${roomDoc.roomNumber} tháng ${month}/${year} thành công!`,
      data: {
        ...populated,
        elecBreakdown: calc.elecBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin cập nhật hóa đơn (Sửa chỉ số trên dòng hoặc đổi trạng thái thanh toán)
// @route   PUT /api/invoices/:id
// @access  Private (Admin)
const updateInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return next(new AppError('Không tìm thấy hóa đơn!', 404));
    }

    const roomDoc = await Room.findById(invoice.room);
    const oldElec = req.body.oldElec !== undefined ? Number(req.body.oldElec) : invoice.oldElec;
    const newElec = req.body.newElec !== undefined ? Number(req.body.newElec) : invoice.newElec;
    const oldWater = req.body.oldWater !== undefined ? Number(req.body.oldWater) : invoice.oldWater;
    const newWater = req.body.newWater !== undefined ? Number(req.body.newWater) : invoice.newWater;
    const serviceFee =
      req.body.serviceFee !== undefined ? Number(req.body.serviceFee) : invoice.serviceFee;

    if (newElec < oldElec) {
      return next(new AppError('Chỉ số điện mới không được nhỏ hơn chỉ số điện cũ!', 400));
    }
    if (newWater < oldWater) {
      return next(new AppError('Chỉ số nước mới không được nhỏ hơn chỉ số nước cũ!', 400));
    }

    const calc = calculateInvoiceAmounts({
      roomPrice: roomDoc ? roomDoc.price : invoice.roomPrice,
      oldElec,
      newElec,
      oldWater,
      newWater,
      serviceFee,
    });

    invoice.oldElec = oldElec;
    invoice.newElec = newElec;
    invoice.oldWater = oldWater;
    invoice.newWater = newWater;
    invoice.roomPrice = calc.roomPrice;
    invoice.elecAmount = calc.elecAmount;
    invoice.waterAmount = calc.waterAmount;
    invoice.serviceFee = calc.serviceFee;
    invoice.totalAmount = calc.totalAmount;

    if (req.body.status) {
      invoice.status = req.body.status;
      invoice.paidAt = req.body.status === 'Đã thanh toán' ? new Date() : null;
    }

    await invoice.save();

    if (roomDoc) {
      roomDoc.lastElecIndex = Math.max(roomDoc.lastElecIndex || 0, newElec);
      roomDoc.lastWaterIndex = Math.max(roomDoc.lastWaterIndex || 0, newWater);
      await roomDoc.save();
    }

    const populated = await Invoice.findById(invoice._id)
      .populate('room', 'roomNumber price area status')
      .populate('tenant', 'name email phone')
      .lean();

    res.status(200).json({
      success: true,
      message: 'Cập nhật hóa đơn thành công!',
      data: {
        ...populated,
        elecBreakdown: calc.elecBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin đổi trạng thái thanh toán hóa đơn ('Đã thanh toán' / 'Chưa thanh toán')
// @route   PATCH /api/invoices/:id/status
// @access  Private (Admin)
const updateInvoiceStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['Chưa thanh toán', 'Đã thanh toán'].includes(status)) {
      return next(new AppError('Trạng thái hóa đơn không hợp lệ!', 400));
    }

    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return next(new AppError('Không tìm thấy hóa đơn!', 404));
    }

    invoice.status = status;
    invoice.paidAt = status === 'Đã thanh toán' ? new Date() : null;
    await invoice.save();

    const populated = await Invoice.findById(invoice._id)
      .populate('room', 'roomNumber price area status')
      .populate('tenant', 'name email phone');

    res.status(200).json({
      success: true,
      message: `Đã cập nhật trạng thái hóa đơn thành "${status}"!`,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Xuất hóa đơn ra file PDF (Dùng pdfkit)
// @route   GET /api/invoices/:id/pdf
// @access  Private (Admin, Tenant sở hữu phòng)
const exportInvoicePDF = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('room', 'roomNumber price area status')
      .populate('tenant', 'name email phone');

    if (!invoice) {
      return next(new AppError('Không tìm thấy hóa đơn!', 404));
    }

    // Kiểm tra quyền 403 Forbidden nếu Tenant cố tải PDF hóa đơn của phòng khác
    const hasAccess = await verifyTenantInvoiceAccess(req.user, invoice);
    if (!hasAccess) {
      return next(
        new AppError(
          'Truy cập bị từ chối (403 Forbidden): Bạn không có quyền xuất PDF hóa đơn của phòng khác!',
          403
        )
      );
    }

    generateInvoicePDF(invoice, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Gửi email nhắc nợ hóa đơn chưa thanh toán (Dùng nodemailer)
// @route   POST /api/invoices/:id/remind
// @access  Private (Admin)
const sendInvoiceReminder = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('room', 'roomNumber price area')
      .populate('tenant', 'name email phone');

    if (!invoice) {
      return next(new AppError('Không tìm thấy hóa đơn!', 404));
    }

    if (invoice.status === 'Đã thanh toán') {
      return next(new AppError('Hóa đơn này đã được thanh toán, không cần nhắc nợ!', 400));
    }

    let tenant = invoice.tenant;
    if (!tenant) {
      const contract = await Contract.findOne({
        room: invoice.room._id,
        status: 'Hiệu lực',
      }).populate('tenant', 'name email phone');
      tenant = contract?.tenant;
    }

    if (!tenant || !tenant.email) {
      return next(
        new AppError('Phòng này hiện chưa có thông tin email người thuê để gửi nhắc nợ!', 400)
      );
    }

    const emailResult = await sendDebtReminderEmail({
      invoice,
      tenant,
      room: invoice.room,
    });

    res.status(200).json({
      success: true,
      message: `Đã gửi email nhắc nợ tới ${tenant.name} (${tenant.email}) thành công!`,
      data: emailResult,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Xóa hóa đơn (Admin)
// @route   DELETE /api/invoices/:id
// @access  Private (Admin)
const deleteInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return next(new AppError('Không tìm thấy hóa đơn!', 404));
    }

    await invoice.deleteOne();
    res.status(200).json({
      success: true,
      message: 'Đã xóa hóa đơn thành công!',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInvoices,
  getUtilitySheet,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  updateInvoiceStatus,
  exportInvoicePDF,
  sendInvoiceReminder,
  deleteInvoice,
};
