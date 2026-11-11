const express = require('express');
const router = express.Router();
const {
  getRepairRequests,
  createRepairRequest,
  updateRepairStatus,
} = require('../controllers/repairRequestController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const upload = require('../config/multer');

router.use(protect);

router
  .route('/')
  .get(getRepairRequests)
  .post(upload.array('images', 5), createRepairRequest);

router.patch('/:id/status', authorize('admin'), updateRepairStatus);
router.put('/:id', authorize('admin'), updateRepairStatus);

module.exports = router;
