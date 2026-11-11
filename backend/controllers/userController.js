const User = require('../models/User');
const Contract = require('../models/Contract');
const AppError = require('../utils/AppError');

// @desc    Lấy danh sách người dùng (Hỗ trợ tìm kiếm $regex, lọc role, phân trang)
// @route   GET /api/users
// @access  Private (Admin)
const getUsers = async (req, res, next) => {
  try {
    const { search = '', role, page = 1, limit = 10, all } = req.query;

    const query = {};
    if (role) {
      query.role = role;
    }
    if (search.trim()) {
      const regex = { $regex: search.trim(), $options: 'i' };
      query.$or = [{ name: regex }, { email: regex }, { phone: regex }];
    }

    if (all === 'true') {
      const users = await User.find(query).sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        data: users,
      });
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      User.countDocuments(query),
    ]);

    // Lấy hợp đồng đang hiệu lực của từng người thuê
    const userIds = users.map((u) => u._id);
    const activeContracts = await Contract.find({
      tenant: { $in: userIds },
      status: 'Hiệu lực',
    })
      .populate('room', 'roomNumber price')
      .lean();

    const contractMap = {};
    activeContracts.forEach((c) => {
      contractMap[c.tenant.toString()] = c;
    });

    const enrichedUsers = users.map((u) => ({
      ...u,
      activeContract: contractMap[u._id.toString()] || null,
    }));

    res.status(200).json({
      success: true,
      data: enrichedUsers,
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

// @desc    Admin tạo mới người thuê (Tenant)
// @route   POST /api/users
// @access  Private (Admin)
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, phone, role = 'tenant' } = req.body;

    if (!name || !email || !password || !phone) {
      return next(new AppError('Vui lòng nhập đầy đủ họ tên, email, mật khẩu và số điện thoại!', 400));
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return next(new AppError('Email này đã tồn tại trong hệ thống!', 409));
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role === 'admin' ? 'admin' : 'tenant',
    });

    res.status(201).json({
      success: true,
      message: 'Tạo tài khoản người dùng thành công!',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin cập nhật thông tin người dùng
// @route   PUT /api/users/:id
// @access  Private (Admin)
const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(new AppError('Không tìm thấy người dùng!', 404));
    }

    const { name, phone, email, password } = req.body;
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (email) user.email = email;
    if (password && password.trim().length >= 6) {
      user.password = password;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Cập nhật người dùng thành công!',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin xóa người dùng
// @route   DELETE /api/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(new AppError('Không tìm thấy người dùng!', 404));
    }

    const activeContract = await Contract.findOne({
      tenant: user._id,
      status: 'Hiệu lực',
    });

    if (activeContract) {
      return next(
        new AppError('Không thể xóa người thuê đang có hợp đồng Hiệu lực. Vui lòng kết thúc hợp đồng trước!', 400)
      );
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Đã xóa người dùng thành công!',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
};
