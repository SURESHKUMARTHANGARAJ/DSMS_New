const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// All routes require authentication
router.use(auth);

// Get all invoices
router.get('/', roleCheck('admin', 'instructor'), invoiceController.getAllInvoices);

// Get invoice by ID
router.get('/:id', invoiceController.getInvoiceById);

// Download invoice PDF
router.get('/:id/download', invoiceController.downloadInvoice);

// Create invoice (Admin only)
router.post('/', roleCheck('admin'), invoiceController.createInvoice);

// Update invoice (Admin only)
router.put('/:id', roleCheck('admin'), invoiceController.updateInvoice);

module.exports = router;

