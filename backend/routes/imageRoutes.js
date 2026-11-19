const express = require('express');
const Image = require('../models/Image');
const AppError = require('../utils/AppError');

const router = express.Router();

// @desc    Trả về ảnh được lưu trong MongoDB
// @route   GET /api/images/:name
// @access  Public
router.get('/:name', async (req, res, next) => {
  try {
    const image = await Image.findOne({ name: req.params.name });
    if (!image) {
      throw new AppError('Không tìm thấy ảnh', 404);
    }

    res.set({
      'Content-Type': image.contentType,
      'Cache-Control': 'public, max-age=604800, immutable',
    });
    res.send(image.data);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
