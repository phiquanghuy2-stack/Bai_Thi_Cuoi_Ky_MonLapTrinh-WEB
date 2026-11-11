const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: [true, 'Vui lòng nhập số phòng'],
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      default: '',
      trim: true,
    },
    location: {
      type: String,
      default: 'Quận Cầu Giấy, Hà Nội',
      trim: true,
    },
    address: {
      type: String,
      default: 'Số 88 Duy Tân, Quận Cầu Giấy, Hà Nội',
      trim: true,
    },
    category: {
      type: String,
      default: 'Studio',
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Vui lòng nhập giá thuê phòng'],
      min: [0, 'Giá phòng không được nhỏ hơn 0'],
    },
    area: {
      type: Number,
      required: [true, 'Vui lòng nhập diện tích phòng (m2)'],
      min: [1, 'Diện tích phải lớn hơn 0'],
    },
    status: {
      type: String,
      enum: ['Trống', 'Đang thuê', 'Đang sửa'],
      default: 'Trống',
    },
    rating: {
      type: Number,
      default: 4.95,
    },
    isGuestFavorite: {
      type: Boolean,
      default: true,
    },
    floor: {
      type: Number,
      default: 2,
    },
    maxGuests: {
      type: Number,
      default: 2,
    },
    amenities: {
      type: [String],
      default: [
        'Wifi 6 tốc độ cao',
        'Điều hòa Inverter 2 chiều',
        'Khóa vân tay 2 lớp',
        'Máy giặt riêng tại phòng',
        'Bếp từ & Hút mùi',
        'Bình nóng lạnh Ariston',
        'Ban công đón nắng',
        'Camera an ninh 24/7',
      ],
    },
    description: {
      type: String,
      default: 'Phòng trọ thoáng mát, an ninh 24/7, giờ giấc tự do, có gác lửng và WC riêng.',
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    lastElecIndex: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastWaterIndex: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Room', roomSchema);
