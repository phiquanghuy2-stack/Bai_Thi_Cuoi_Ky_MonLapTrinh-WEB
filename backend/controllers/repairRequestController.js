const RepairRequest = require('../models/RepairRequest');
const Contract = require('../models/Contract');
const Room = require('../models/Room');
const AppError = require('../utils/AppError');

// @desc    Lấy danh sách yêu cầu sửa chữa (Admin xem tất cả; Tenant chỉ xem của mình)
// @route   GET /api/repair-requests
// @access  Private (Admin, Tenant)
const getRepairRequests = async (req, res, next) => {
  try {
    const { status, room, search = '', page = 1, limit = 10 } = req.query;

    const query = {};

    if (req.user.role === 'tenant') {
      query.tenant = req.user._id;
    }

    if (status) {
      const statusList = status.split(',').map((s) => s.trim()).filter(Boolean);
      query.status = statusList.length > 1 ? { $in: statusList } : statusList[0];
    }

    if (room) {
      query.room = room;
    }

    if (search.trim()) {
      const regex = { $regex: search.trim(), $options: 'i' };
      query.$or = [{ title: regex }, { description: regex }];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNum - 1) * limitNum;

    const [requests, total] = await Promise.all([
      RepairRequest.find(query)
        .populate('tenant', 'name email phone avatar')
        .populate('room', 'roomNumber price status')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      RepairRequest.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: requests,
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

// @desc    Tenant tạo yêu cầu sửa chữa kèm upload ảnh bằng Multer
// @route   POST /api/repair-requests
// @access  Private (Tenant, Admin)
const createRepairRequest = async (req, res, next) => {
  try {
    const { title, description, room } = req.body;

    if (!title || !description) {
      return next(new AppError('Vui lòng nhập đầy đủ tiêu đề và mô tả sự cố!', 400));
    }

    let targetRoomId = room;

    // Nếu là Tenant: kiểm tra chặt chẽ phòng phải thuộc hợp đồng đang Hiệu lực của Tenant
    if (req.user.role === 'tenant') {
      const activeContracts = await Contract.find({
        tenant: req.user._id,
        status: 'Hiệu lực',
      });

      if (activeContracts.length === 0) {
        return next(
          new AppError('Bạn hiện chưa có hợp đồng thuê phòng Hiệu lực nào để gửi yêu cầu sửa chữa!', 400)
        );
      }

      if (targetRoomId) {
        const ownsRoom = activeContracts.some(
          (c) => c.room.toString() === targetRoomId.toString()
        );
        if (!ownsRoom) {
          return next(
            new AppError(
              'Truy cập bị từ chối (403 Forbidden): Bạn không thể gửi yêu cầu sửa chữa cho phòng của người khác!',
              403
            )
          );
        }
      } else {
        targetRoomId = activeContracts[0].room;
      }
    }

    if (!targetRoomId) {
      return next(new AppError('Vui lòng chọn phòng cần sửa chữa!', 400));
    }

    const roomDoc = await Room.findById(targetRoomId);
    if (!roomDoc) {
      return next(new AppError('Không tìm thấy phòng trọ!', 404));
    }

    // Lấy danh sách file ảnh đã được Multer lưu vào thư mục /uploads
    const imagePaths = req.files
      ? req.files.map((file) => `/uploads/${file.filename}`)
      : [];

    const repairRequest = await RepairRequest.create({
      tenant: req.user._id,
      room: roomDoc._id,
      title: title.trim(),
      description: description.trim(),
      images: imagePaths,
      status: 'Mới',
    });

    const populated = await RepairRequest.findById(repairRequest._id)
      .populate('tenant', 'name email phone')
      .populate('room', 'roomNumber price status');

    res.status(201).json({
      success: true,
      message: 'Đã gửi yêu cầu sửa chữa thành công!',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin duyệt và cập nhật trạng thái yêu cầu sửa chữa ('Mới', 'Đang xử lý', 'Xong')
// @route   PATCH /api/repair-requests/:id/status
// @access  Private (Admin)
const updateRepairStatus = async (req, res, next) => {
  try {
    const { status, adminNote } = req.body;
    const validStatuses = ['Mới', 'Đang xử lý', 'Xong'];

    if (!status || !validStatuses.includes(status)) {
      return next(new AppError('Trạng thái không hợp lệ (Chỉ chấp nhận: Mới, Đang xử lý, Xong)!', 400));
    }

    const repairRequest = await RepairRequest.findById(req.params.id);
    if (!repairRequest) {
      return next(new AppError('Không tìm thấy yêu cầu sửa chữa!', 404));
    }

    repairRequest.status = status;
    if (adminNote !== undefined) {
      repairRequest.adminNote = adminNote;
    }

    await repairRequest.save();

    const populated = await RepairRequest.findById(repairRequest._id)
      .populate('tenant', 'name email phone')
      .populate('room', 'roomNumber price status');

    res.status(200).json({
      success: true,
      message: `Đã cập nhật trạng thái yêu cầu sang "${status}"!`,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRepairRequests,
  createRepairRequest,
  updateRepairStatus,
};
