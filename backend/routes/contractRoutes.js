const express = require('express');
const router = express.Router();
const {
  getContracts,
  getContractById,
  createContract,
  terminateContract,
  updateContract,
} = require('../controllers/contractController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect);

router
  .route('/')
  .get(getContracts)
  .post(authorize('admin'), createContract);

router
  .route('/:id')
  .get(getContractById)
  .put(authorize('admin'), updateContract);

router.patch('/:id/terminate', authorize('admin'), terminateContract);

module.exports = router;
