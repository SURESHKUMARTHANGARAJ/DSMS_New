const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// All routes require authentication
router.use(auth);

// Get all payments
router.get('/', roleCheck('admin', 'instructor'), paymentController.getAllPayments);

// Get payment by ID
router.get('/:id', paymentController.getPaymentById);

// Create payment (Admin only)
router.post('/', roleCheck('admin'), paymentController.createPayment);

// Update payment (Admin only)
router.put('/:id', roleCheck('admin'), paymentController.updatePayment);

// Delete payment (Admin only)
router.delete('/:id', roleCheck('admin'), paymentController.deletePayment);

module.exports = router;

