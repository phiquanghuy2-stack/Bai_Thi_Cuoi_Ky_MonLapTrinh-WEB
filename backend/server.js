const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');

// Load biến môi trường từ .env
dotenv.config();

// Kết nối MongoDB
connectDB();

const app = express();

// Middlewares cơ bản
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Public thư mục uploads để truy cập file/ảnh đã upload qua Multer
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route kiểm tra trạng thái hoạt động của Server
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API Hệ thống Quản lý Nhà trọ đang hoạt động!',
  });
});

// Gắn kết toàn bộ RESTful API Routes (Danh từ số nhiều)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/contracts', require('./routes/contractRoutes'));
app.use('/api/repair-requests', require('./routes/repairRequestRoutes'));
app.use('/api/invoices', require('./routes/invoiceRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// Middleware bắt lỗi 404 và xử lý lỗi tập trung (BẮT BUỘC)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});
