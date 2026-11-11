const Contract = require('../models/Contract');
const Room = require('../models/Room');
const User = require('../models/User');
const AppError = require('../utils/AppError');

// @desc    Lấy danh sách hợp đồng (Admin xem tất cả + lọc + phân trang; Tenant chỉ xem của mình)
// @route   GET /api/contracts
// @access  Private (Admin, Tenant)
const getContracts = async (req, res, next) => {
  try {
    const { status, room, page = 1, limit = 10 } = req.query;

    const query = {};

    // Nếu là Tenant: chỉ được xem hợp đồng của chính mình
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

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNum - 1) * limitNum;

    const [contracts, total] = await Promise.all([
      Contract.find(query)
        .populate('room', 'roomNumber price area status')
        .populate('tenant', 'name email phone avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Contract.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: contracts,
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

// @desc    Xem chi tiết 1 hợp đồng (Phân quyền chặt chẽ 403 Forbidden nếu Tenant xem hợp đồng phòng khác)
// @route   GET /api/contracts/:id
// @access  Private (Admin, Tenant)
const getContractById = async (req, res, next) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate('room', 'roomNumber price area status description')
      .populate('tenant', 'name email phone avatar');

    if (!contract) {
      return next(new AppError('Không tìm thấy hợp đồng!', 404));
    }

    if (
      req.user.role === 'tenant' &&
      contract.tenant._id.toString() !== req.user._id.toString()
    ) {
      return next(
        new AppError('Truy cập bị từ chối (403 Forbidden): Bạn không có quyền xem hợp đồng của người thuê khác!', 403)
      );
    }

    res.status(200).json({
      success: true,
      data: contract,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin tạo hợp đồng mới (Chốt chặn phòng đang có hợp đồng Hiệu lực & Tự động đổi trạng thái phòng)
// @route   POST /api/contracts
// @access  Private (Admin)
const createContract = async (req, res, next) => {
  try {
    const { room, tenant, startDate, endDate, deposit = 0, notes = '' } = req.body;

    if (!room || !tenant || !startDate || !endDate) {
      return next(new AppError('Vui lòng chọn đầy đủ phòng, người thuê, ngày bắt đầu và ngày kết thúc!', 400));
    }

    if (new Date(endDate) <= new Date(startDate)) {
      return next(new AppError('Ngày kết thúc hợp đồng phải sau ngày bắt đầu!', 400));
    }

    const [roomDoc, tenantDoc] = await Promise.all([
      Room.findById(room),
      User.findById(tenant),
    ]);

    if (!roomDoc) {
      return next(new AppError('Phòng trọ không tồn tại!', 404));
    }

    if (!tenantDoc) {
      return next(new AppError('Người thuê không tồn tại!', 404));
    }

    // LOGIC CHỐT CHẶN BẮT BUỘC: Không cho phép tạo hợp đồng mới vào phòng đang có hợp đồng 'Hiệu lực'
    const existingActiveContract = await Contract.findOne({
      room: roomDoc._id,
      status: 'Hiệu lực',
    }).populate('tenant', 'name');

    if (existingActiveContract) {
      return next(
        new AppError(
          `Phòng ${roomDoc.roomNumber} đang có hợp đồng Hiệu lực (Người thuê: ${existingActiveContract.tenant?.name || 'N/A'}). Không thể tạo hợp đồng mới!`,
          400
        )
      );
    }

    const contract = await Contract.create({
      room: roomDoc._id,
      tenant: tenantDoc._id,
      startDate,
      endDate,
      deposit: Number(deposit) || 0,
      status: 'Hiệu lực',
      notes,
    });

    // TỰ ĐỘNG CẬP NHẬT TRẠNG THÁI PHÒNG SANG 'Đang thuê'
    roomDoc.status = 'Đang thuê';
    await roomDoc.save();

    const populatedContract = await Contract.findById(contract._id)
      .populate('room', 'roomNumber price area status')
      .populate('tenant', 'name email phone');

    res.status(201).json({
      success: true,
      message: `Tạo hợp đồng phòng ${roomDoc.roomNumber} thành công! Trạng thái phòng đã tự động chuyển sang "Đang thuê".`,
      data: populatedContract,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin kết thúc hợp đồng (Tự động đổi status Hợp đồng -> 'Đã kết thúc' và Phòng -> 'Trống')
// @route   PATCH /api/contracts/:id/terminate
// @access  Private (Admin)
const terminateContract = async (req, res, next) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) {
      return next(new AppError('Không tìm thấy hợp đồng!', 404));
    }

    if (contract.status === 'Đã kết thúc') {
      return next(new AppError('Hợp đồng này đã kết thúc trước đó!', 400));
    }

    contract.status = 'Đã kết thúc';
    contract.endDate = new Date();
    await contract.save();

    // Kiểm tra xem phòng còn hợp đồng hiệu lực nào khác không, nếu không thì tự động đổi trạng thái Phòng về 'Trống'
    const otherActive = await Contract.findOne({
      room: contract.room,
      status: 'Hiệu lực',
      _id: { $ne: contract._id },
    });

    let updatedRoom = null;
    if (!otherActive) {
      updatedRoom = await Room.findByIdAndUpdate(
        contract.room,
        { status: 'Trống' },
        { new: true }
      );
    }

    const populatedContract = await Contract.findById(contract._id)
      .populate('room', 'roomNumber price area status')
      .populate('tenant', 'name email phone');

    res.status(200).json({
      success: true,
      message: `Đã kết thúc hợp đồng! Phòng ${updatedRoom?.roomNumber || ''} đã tự động chuyển về trạng thái "Trống".`,
      data: populatedContract,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin cập nhật hợp đồng
// @route   PUT /api/contracts/:id
// @access  Private (Admin)
const updateContract = async (req, res, next) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) {
      return next(new AppError('Không tìm thấy hợp đồng!', 404));
    }

    const { startDate, endDate, deposit, status, notes } = req.body;

    if (startDate) contract.startDate = startDate;
    if (endDate) contract.endDate = endDate;
    if (deposit !== undefined) contract.deposit = Number(deposit);
    if (notes !== undefined) contract.notes = notes;

    // Nếu thay đổi trạng thái hợp đồng
    if (status && status !== contract.status) {
      if (status === 'Hiệu lực') {
        const conflict = await Contract.findOne({
          room: contract.room,
          status: 'Hiệu lực',
          _id: { $ne: contract._id },
        });
        if (conflict) {
          return next(new AppError('Phòng này đã có một hợp đồng Hiệu lực khác!', 400));
        }
        contract.status = 'Hiệu lực';
        await Room.findByIdAndUpdate(contract.room, { status: 'Đang thuê' });
      } else if (status === 'Đã kết thúc') {
        contract.status = 'Đã kết thúc';
        const otherActive = await Contract.findOne({
          room: contract.room,
          status: 'Hiệu lực',
          _id: { $ne: contract._id },
        });
        if (!otherActive) {
          await Room.findByIdAndUpdate(contract.room, { status: 'Trống' });
        }
      }
    }

    await contract.save();

    const populated = await Contract.findById(contract._id)
      .populate('room', 'roomNumber price area status')
      .populate('tenant', 'name email phone');

    res.status(200).json({
      success: true,
      message: 'Cập nhật hợp đồng thành công!',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getContracts,
  getContractById,
  createContract,
  terminateContract,
  updateContract,
};
