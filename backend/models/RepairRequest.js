const mongoose = require('mongoose');

const repairRequestSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Yêu cầu sửa chữa phải có thông tin người thuê'],
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: [true, 'Yêu cầu sửa chữa phải gắn với phòng cụ thể'],
    },
    title: {
      type: String,
      required: [true, 'Vui lòng nhập tiêu đề sự cố'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Vui lòng nhập mô tả chi tiết sự cố'],
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['Mới', 'Đang xử lý', 'Xong'],
      default: 'Mới',
    },
    adminNote: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('RepairRequest', repairRequestSchema);
