const AppError = require('../utils/AppError');

// Middleware bắt lỗi 404 khi route không tồn tại
const notFound = (req, res, next) => {
  const error = new AppError(`Không tìm thấy đường dẫn: ${req.originalUrl}`, 404);
  next(error);
};

// Middleware xử lý lỗi tập trung (Centralized Error Handler)
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);
  let message = err.message || 'Lỗi máy chủ nội bộ (Internal Server Error)';

  // 1. Lỗi Mongoose ObjectId không hợp lệ (CastError)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Định dạng ID không hợp lệ: ${err.value}`;
  }

  // 2. Lỗi trùng khóa Unique trong MongoDB (Duplicate Key Error - Code 11000)
  if (err.code === 11000) {
    statusCode = 409;
    const fields = Object.keys(err.keyValue || {});
    if (fields.includes('room') && fields.includes('month') && fields.includes('year')) {
      message = `Phòng này đã tồn tại hóa đơn trong tháng ${err.keyValue.month}/${err.keyValue.year}!`;
    } else if (fields.includes('email')) {
      message = 'Email này đã được sử dụng bởi một tài khoản khác!';
    } else if (fields.includes('roomNumber')) {
      message = `Số phòng "${err.keyValue.roomNumber}" đã tồn tại trong hệ thống!`;
    } else {
      message = `Dữ liệu bị trùng lặp ở trường: ${fields.join(', ')}`;
    }
  }

  // 3. Lỗi Validate của Mongoose (ValidationError)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join('; ');
  }

  // 4. Lỗi JWT không hợp lệ hoặc hết hạn
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token xác thực không hợp lệ, vui lòng đăng nhập lại!';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!';
  }

  // 5. Lỗi upload file từ Multer
  if (err.name === 'MulterError') {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'Kích thước file vượt quá giới hạn cho phép (Tối đa 5MB/ảnh)!';
    } else {
      message = `Lỗi tải file: ${err.message}`;
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};

module.exports = { notFound, errorHandler };
