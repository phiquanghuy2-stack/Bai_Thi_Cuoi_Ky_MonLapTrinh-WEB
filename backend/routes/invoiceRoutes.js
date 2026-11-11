const express = require('express');
const router = express.Router();
const {
  getInvoices,
  getUtilitySheet,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  updateInvoiceStatus,
  exportInvoicePDF,
  sendInvoiceReminder,
  deleteInvoice,
} = require('../controllers/invoiceController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect);

router.get('/sheet', authorize('admin'), getUtilitySheet);

router
  .route('/')
  .get(getInvoices)
  .post(authorize('admin'), createInvoice);

router.get('/:id/pdf', exportInvoicePDF);
router.post('/:id/remind', authorize('admin'), sendInvoiceReminder);
router.patch('/:id/status', authorize('admin'), updateInvoiceStatus);

router
  .route('/:id')
  .get(getInvoiceById)
  .put(authorize('admin'), updateInvoice)
  .delete(authorize('admin'), deleteInvoice);

module.exports = router;
