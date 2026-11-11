const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: [true, 'Hóa đơn phải thuộc về một phòng'],
    },
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    month: {
      type: Number,
      required: [true, 'Vui lòng nhập tháng lập hóa đơn'],
      min: [1, 'Tháng phải từ 1 đến 12'],
      max: [12, 'Tháng phải từ 1 đến 12'],
    },
    year: {
      type: Number,
      required: [true, 'Vui lòng nhập năm lập hóa đơn'],
      min: [2020, 'Năm không hợp lệ'],
    },
    oldElec: {
      type: Number,
      required: [true, 'Vui lòng nhập chỉ số điện cũ'],
      min: [0, 'Chỉ số điện cũ không được âm'],
    },
    newElec: {
      type: Number,
      required: [true, 'Vui lòng nhập chỉ số điện mới'],
      min: [0, 'Chỉ số điện mới không được âm'],
      validate: {
        validator: function (value) {
          return value >= this.oldElec;
        },
        message: 'Chỉ số điện mới phải lớn hơn hoặc bằng chỉ số điện cũ',
      },
    },
    oldWater: {
      type: Number,
      required: [true, 'Vui lòng nhập chỉ số nước cũ'],
      min: [0, 'Chỉ số nước cũ không được âm'],
    },
    newWater: {
      type: Number,
      required: [true, 'Vui lòng nhập chỉ số nước mới'],
      min: [0, 'Chỉ số nước mới không được âm'],
      validate: {
        validator: function (value) {
          return value >= this.oldWater;
        },
        message: 'Chỉ số nước mới phải lớn hơn hoặc bằng chỉ số nước cũ',
      },
    },
    roomPrice: {
      type: Number,
      default: 0,
    },
    elecAmount: {
      type: Number,
      default: 0,
    },
    waterAmount: {
      type: Number,
      default: 0,
    },
    serviceFee: {
      type: Number,
      default: 100000,
    },
    totalAmount: {
      type: Number,
      required: [true, 'Tổng tiền hóa đơn là bắt buộc'],
      min: [0, 'Tổng tiền không được âm'],
    },
    status: {
      type: String,
      enum: ['Chưa thanh toán', 'Đã thanh toán'],
      default: 'Chưa thanh toán',
    },
    paidAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// KHÓA TRÙNG LẶP CẤP DATABASE: 1 phòng chỉ được có duy nhất 1 hóa đơn trong 1 tháng/năm cụ thể
invoiceSchema.index({ room: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
