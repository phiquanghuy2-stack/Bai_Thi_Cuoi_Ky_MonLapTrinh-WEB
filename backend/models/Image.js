const mongoose = require('mongoose');

// Ảnh lưu thẳng trong MongoDB (dạng nhị phân) để ai clone dự án về cũng có ảnh phòng,
// không phụ thuộc thư mục uploads/ hay link ảnh bên ngoài.
// Truy cập qua: GET /api/images/:name  (vd: /api/images/1522708323590-d24dbb6b0267.jpg)
const imageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    contentType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      default: 0,
    },
    data: {
      type: Buffer,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Image', imageSchema);
