const express = require('express');
const router = express.Router();
const {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
} = require('../controllers/roomController');
const { protect, optionalAuth, authorize } = require('../middlewares/authMiddleware');
const upload = require('../config/multer');

router
  .route('/')
  .get(optionalAuth, getRooms)
  .post(protect, authorize('admin'), upload.array('images', 5), createRoom);

router
  .route('/:id')
  .get(optionalAuth, getRoomById)
  .put(protect, authorize('admin'), upload.array('images', 5), updateRoom)
  .delete(protect, authorize('admin'), deleteRoom);

module.exports = router;
