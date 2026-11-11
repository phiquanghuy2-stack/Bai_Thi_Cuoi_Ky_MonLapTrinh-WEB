const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Contract = require('../models/Contract');
const AppError = require('../utils/AppError');

// Hàm tạo JWT có thời hạn
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// @desc    Đăng ký tài khoản mới
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone) {
      return next(new AppError('Vui lòng điền đầy đủ họ tên, email, mật khẩu và số điện thoại!', 400));
    }

    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return next(new AppError('Email này đã được đăng ký!', 409));
    }

    // Mặc định đăng ký public là tenant
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: 'tenant',
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công!',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          avatar: user.avatar,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Đăng nhập
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!email || !password) {
      return next(new AppError('Vui lòng nhập đầy đủ email và mật khẩu!', 400));
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Tìm user theo email
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      return next(new AppError('Email hoặc mật khẩu không chính xác!', 401));
    }

    // Kiểm tra mật khẩu
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return next(new AppError('Email hoặc mật khẩu không chính xác!', 401));
    }

    // Lấy thêm thông tin hợp đồng đang hiệu lực nếu là người thuê
    let activeContract = null;
    if (user.role === 'tenant') {
      activeContract = await Contract.findOne({
        tenant: user._id,
        status: 'Hiệu lực',
      }).populate('room', 'roomNumber price area status');
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công!',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          avatar: user.avatar,
          activeContract,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Lấy thông tin người dùng hiện tại
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    let activeContract = null;

    if (user.role === 'tenant') {
      activeContract = await Contract.findOne({
        tenant: user._id,
        status: 'Hiệu lực',
      }).populate('room', 'roomNumber price area status');
    }

    res.status(200).json({
      success: true,
      data: {
        ...user.toObject(),
        activeContract,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cập nhật thông tin cá nhân & avatar
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return next(new AppError('Không tìm thấy người dùng!', 404));
    }

    const { name, phone, currentPassword, newPassword } = req.body;

    if (name) user.name = name;
    if (phone) user.phone = phone;

    if (req.file) {
      user.avatar = `/uploads/${req.file.filename}`;
    }

    if (newPassword) {
      if (!currentPassword) {
        return next(new AppError('Vui lòng nhập mật khẩu hiện tại để đổi mật khẩu mới!', 400));
      }
      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return next(new AppError('Mật khẩu hiện tại không đúng!', 400));
      }
      user.password = newPassword;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Cập nhật hồ sơ thành công!',
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

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
};
