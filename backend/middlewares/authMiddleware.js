const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');

// Middleware kiểm tra JWT (Bắt buộc đăng nhập)
const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.query && req.query.token) {
      // Hỗ trợ truyền token qua query khi tải file PDF trực tiếp trên trình duyệt
      token = req.query.token;
    }

    if (!token) {
      return next(new AppError('Bạn chưa đăng nhập. Vui lòng cung cấp Token xác thực!', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(decoded.id).select('-password');

    if (!currentUser) {
      return next(new AppError('Người dùng sở hữu Token này không còn tồn tại!', 401));
    }

    req.user = currentUser;
    next();
  } catch (error) {
    next(error);
  }
};

// Middleware kiểm tra JWT tùy chọn (Dành cho route cả Guest, Tenant, Admin đều gọi được)
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const currentUser = await User.findById(decoded.id).select('-password');
      if (currentUser) {
        req.user = currentUser;
      }
    }
    next();
  } catch (error) {
    // Nếu token lỗi ở route public thì vẫn cho qua với tư cách Guest
    next();
  }
};

// Middleware phân quyền theo Role (Role-based Authorization)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Truy cập bị từ chối (403 Forbidden): Vai trò '${req.user?.role || 'guest'}' không có quyền thực hiện thao tác này!`,
          403
        )
      );
    }
    next();
  };
};

module.exports = { protect, optionalAuth, authorize };
