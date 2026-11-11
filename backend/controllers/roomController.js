const Room = require('../models/Room');
const Contract = require('../models/Contract');
const Invoice = require('../models/Invoice');
const AppError = require('../utils/AppError');

// @desc    Lấy danh sách phòng (Hỗ trợ lọc địa điểm location, loại phòng category, khoảng giá, diện tích)
// @route   GET /api/rooms
// @access  Public (Optional Auth)
const getRooms = async (req, res, next) => {
  try {
    const {
      search = '',
      location = '',
      category = '',
      status,
      minPrice,
      maxPrice,
      minArea,
      maxArea,
      page = 1,
      limit = 12,
      all,
    } = req.query;

    const query = {};

    const isAdmin = req.user && req.user.role === 'admin';
    if (!isAdmin && req.query.guestOnly === 'true') {
      query.status = 'Trống';
    } else if (status) {
      const statusList = status.split(',').map((s) => s.trim()).filter(Boolean);
      query.status = statusList.length > 1 ? { $in: statusList } : statusList[0];
    } else if (!req.user) {
      query.status = 'Trống';
    }

    const andConditions = [];

    // Tìm kiếm theo từ khóa (Số phòng, tiêu đề, mô tả, địa chỉ) dùng $regex
    if (search.trim()) {
      const regex = { $regex: search.trim(), $options: 'i' };
      andConditions.push({
        $or: [
          { roomNumber: regex },
          { title: regex },
          { description: regex },
          { location: regex },
          { address: regex },
        ],
      });
    }

    // Lọc theo Địa điểm (Khu vực / Quận / Thành phố) dùng $regex
    if (location.trim()) {
      const locRegex = { $regex: location.trim(), $options: 'i' };
      andConditions.push({
        $or: [{ location: locRegex }, { address: locRegex }],
      });
    }

    // Lọc theo phân loại không gian (Studio, Duplex, Balcony, Luxury...)
    if (category.trim() && category.trim() !== 'All') {
      andConditions.push({
        category: { $regex: category.trim(), $options: 'i' },
      });
    }

    if (andConditions.length > 0) {
      query.$and = andConditions;
    }

    // Lọc theo khoảng giá
    if (minPrice !== undefined && minPrice !== '') {
      query.price = { ...query.price, $gte: Number(minPrice) };
    }
    if (maxPrice !== undefined && maxPrice !== '') {
      query.price = { ...query.price, $lte: Number(maxPrice) };
    }

    // Lọc theo diện tích
    if (minArea !== undefined && minArea !== '') {
      query.area = { ...query.area, $gte: Number(minArea) };
    }
    if (maxArea !== undefined && maxArea !== '') {
      query.area = { ...query.area, $lte: Number(maxArea) };
    }

    if (all === 'true') {
      const rooms = await Room.find(query).sort({ roomNumber: 1 }).lean();
      const activeContracts = await Contract.find({ status: 'Hiệu lực' })
        .populate('tenant', 'name email phone')
        .lean();

      const contractMap = {};
      activeContracts.forEach((c) => {
        contractMap[c.room.toString()] = c;
      });

      const enriched = rooms.map((r) => ({
        ...r,
        activeContract: contractMap[r._id.toString()] || null,
      }));

      return res.status(200).json({
        success: true,
        data: enriched,
      });
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 12);
    const skip = (pageNum - 1) * limitNum;

    const [rooms, total] = await Promise.all([
      Room.find(query).sort({ roomNumber: 1 }).skip(skip).limit(limitNum).lean(),
      Room.countDocuments(query),
    ]);

    let resultRooms = rooms;
    if (isAdmin && rooms.length > 0) {
      const roomIds = rooms.map((r) => r._id);
      const activeContracts = await Contract.find({
        room: { $in: roomIds },
        status: 'Hiệu lực',
      })
        .populate('tenant', 'name email phone')
        .lean();

      const contractMap = {};
      activeContracts.forEach((c) => {
        contractMap[c.room.toString()] = c;
      });

      resultRooms = rooms.map((r) => ({
        ...r,
        activeContract: contractMap[r._id.toString()] || null,
      }));
    }

    res.status(200).json({
      success: true,
      data: resultRooms,
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

// @desc    Xem chi tiết 1 phòng
// @route   GET /api/rooms/:id
// @access  Public
const getRoomById = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id).lean();
    if (!room) {
      return next(new AppError('Không tìm thấy phòng trọ!', 404));
    }

    const activeContract = await Contract.findOne({
      room: room._id,
      status: 'Hiệu lực',
    }).populate('tenant', 'name email phone');

    // Lấy thêm danh sách các phòng trống tương tự cùng khu vực để gợi ý
    const similarRooms = await Room.find({
      _id: { $ne: room._id },
      status: 'Trống',
    })
      .limit(4)
      .lean();

    res.status(200).json({
      success: true,
      data: {
        ...room,
        activeContract: activeContract || null,
        similarRooms,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin thêm phòng mới (Hỗ trợ upload ảnh bằng Multer)
// @route   POST /api/rooms
// @access  Private (Admin)
const createRoom = async (req, res, next) => {
  try {
    const {
      roomNumber,
      title,
      location = 'Quận Cầu Giấy, Hà Nội',
      address = '',
      category = 'Studio',
      price,
      area,
      floor = 2,
      maxGuests = 2,
      status = 'Trống',
      description,
      lastElecIndex = 0,
      lastWaterIndex = 0,
    } = req.body;

    if (!roomNumber || price === undefined || area === undefined) {
      return next(new AppError('Vui lòng nhập đầy đủ số phòng, giá thuê và diện tích!', 400));
    }

    const existing = await Room.findOne({ roomNumber: roomNumber.trim() });
    if (existing) {
      return next(new AppError(`Phòng ${roomNumber} đã tồn tại!`, 409));
    }

    const uploadedImages = req.files
      ? req.files.map((file) => `/uploads/${file.filename}`)
      : [];

    const room = await Room.create({
      roomNumber: roomNumber.trim(),
      title: title || `Căn hộ ${category} tại ${location}`,
      location,
      address: address || `Tòa nhà HVA HOMESTAY, ${location}`,
      category,
      price: Number(price),
      area: Number(area),
      floor: Number(floor) || 2,
      maxGuests: Number(maxGuests) || 2,
      status,
      description,
      images: uploadedImages,
      lastElecIndex: Number(lastElecIndex) || 0,
      lastWaterIndex: Number(lastWaterIndex) || 0,
    });

    res.status(201).json({
      success: true,
      message: `Thêm phòng ${room.roomNumber} thành công!`,
      data: room,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin cập nhật thông tin phòng
// @route   PUT /api/rooms/:id
// @access  Private (Admin)
const updateRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return next(new AppError('Không tìm thấy phòng trọ!', 404));
    }

    const {
      roomNumber,
      title,
      location,
      address,
      category,
      price,
      area,
      floor,
      maxGuests,
      status,
      description,
      lastElecIndex,
      lastWaterIndex,
    } = req.body;

    if (status === 'Trống' && room.status === 'Đang thuê') {
      const activeContract = await Contract.findOne({
        room: room._id,
        status: 'Hiệu lực',
      });
      if (activeContract) {
        return next(
          new AppError(
            'Phòng đang có hợp đồng Hiệu lực. Vui lòng kết thúc hợp đồng để hệ thống tự động chuyển phòng về trạng thái Trống!',
            400
          )
        );
      }
    }

    if (roomNumber !== undefined) room.roomNumber = roomNumber.trim();
    if (title !== undefined) room.title = title;
    if (location !== undefined) room.location = location;
    if (address !== undefined) room.address = address;
    if (category !== undefined) room.category = category;
    if (price !== undefined) room.price = Number(price);
    if (area !== undefined) room.area = Number(area);
    if (floor !== undefined) room.floor = Number(floor);
    if (maxGuests !== undefined) room.maxGuests = Number(maxGuests);
    if (status !== undefined) room.status = status;
    if (description !== undefined) room.description = description;
    if (lastElecIndex !== undefined) room.lastElecIndex = Number(lastElecIndex);
    if (lastWaterIndex !== undefined) room.lastWaterIndex = Number(lastWaterIndex);

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => `/uploads/${file.filename}`);
      room.images = [...room.images, ...newImages];
    }

    await room.save();

    res.status(200).json({
      success: true,
      message: `Cập nhật phòng ${room.roomNumber} thành công!`,
      data: room,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin xóa phòng
// @route   DELETE /api/rooms/:id
// @access  Private (Admin)
const deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return next(new AppError('Không tìm thấy phòng trọ!', 404));
    }

    const activeContract = await Contract.findOne({
      room: room._id,
      status: 'Hiệu lực',
    });

    if (activeContract) {
      return next(new AppError('Không thể xóa phòng đang có hợp đồng Hiệu lực!', 400));
    }

    const unpaidInvoice = await Invoice.findOne({
      room: room._id,
      status: 'Chưa thanh toán',
    });

    if (unpaidInvoice) {
      return next(new AppError('Không thể xóa phòng đang còn hóa đơn chưa thanh toán!', 400));
    }

    await room.deleteOne();

    res.status(200).json({
      success: true,
      message: `Đã xóa phòng ${room.roomNumber} thành công!`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
};
