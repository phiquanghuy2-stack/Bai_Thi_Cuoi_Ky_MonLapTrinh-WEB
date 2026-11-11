const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: [true, 'Hợp đồng phải gắn với một phòng'],
    },
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Hợp đồng phải gắn với một người thuê'],
    },
    startDate: {
      type: Date,
      required: [true, 'Vui lòng chọn ngày bắt đầu hợp đồng'],
    },
    endDate: {
      type: Date,
      required: [true, 'Vui lòng chọn ngày kết thúc hợp đồng'],
    },
    deposit: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Hiệu lực', 'Đã kết thúc'],
      default: 'Hiệu lực',
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index phục vụ truy vấn hợp đồng đang hiệu lực của phòng hoặc người thuê nhanh chóng
contractSchema.index({ room: 1, status: 1 });
contractSchema.index({ tenant: 1, status: 1 });

module.exports = mongoose.model('Contract', contractSchema);
