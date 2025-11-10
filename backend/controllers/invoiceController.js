const Invoice = require('../models/Invoice');
const Student = require('../models/Student');
const Payment = require('../models/Payment');
const generateInvoicePDF = require('../utils/generateInvoice');

// Generate unique invoice number
const generateInvoiceNumber = () => {
  const prefix = 'INV';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
};

// Get all invoices
exports.getAllInvoices = async (req, res) => {
  try {
    const { studentId, status } = req.query;
    const filter = {};

    if (studentId) filter.studentId = studentId;
    if (status) filter.status = status;

    const invoices = await Invoice.find(filter)
      .populate('studentId', 'userId')
      .sort({ generatedDate: -1 });

    // Populate student user details
    for (let invoice of invoices) {
      if (invoice.studentId && invoice.studentId.userId) {
        await invoice.populate('studentId.userId', 'name email');
      }
    }

    res.json(invoices);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get invoice by ID
exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('studentId', 'userId');

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    if (invoice.studentId && invoice.studentId.userId) {
      await invoice.populate('studentId.userId', 'name email phone');
    }

    // Get payments for this invoice
    const payments = await Payment.find({ invoiceId: invoice._id })
      .sort({ paymentDate: -1 });

    res.json({
      ...invoice.toObject(),
      payments
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create invoice
exports.createInvoice = async (req, res) => {
  try {
    const { studentId, items, totalAmount, dueDate } = req.body;

    // Validate student exists
    const student = await Student.findById(studentId)
      .populate('userId', 'name email phone');
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Generate invoice number
    let invoiceNumber = generateInvoiceNumber();
    let exists = await Invoice.findOne({ invoiceNumber });
    while (exists) {
      invoiceNumber = generateInvoiceNumber();
      exists = await Invoice.findOne({ invoiceNumber });
    }

    const invoice = new Invoice({
      invoiceNumber,
      studentId,
      items: items || [],
      totalAmount,
      dueDate,
      status: 'pending'
    });

    await invoice.save();

    // Generate PDF
    try {
      const pdfPath = await generateInvoicePDF(invoice, student, items || []);
      invoice.pdfPath = pdfPath;
      await invoice.save();
    } catch (pdfError) {
      console.error('Error generating PDF:', pdfError);
      // Continue even if PDF generation fails
    }

    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate('studentId', 'userId');

    res.status(201).json({
      message: 'Invoice created successfully',
      invoice: populatedInvoice
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update invoice
exports.updateInvoice = async (req, res) => {
  try {
    const { items, totalAmount, status, dueDate } = req.body;
    const invoiceId = req.params.id;

    const updateData = {};
    if (items) updateData.items = items;
    if (totalAmount !== undefined) updateData.totalAmount = totalAmount;
    if (status) updateData.status = status;
    if (dueDate) updateData.dueDate = dueDate;

    const invoice = await Invoice.findByIdAndUpdate(
      invoiceId,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('studentId', 'userId');

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Regenerate PDF if invoice details changed
    if (items || totalAmount !== undefined) {
      const student = await Student.findById(invoice.studentId._id)
        .populate('userId', 'name email phone');
      
      try {
        const pdfPath = await generateInvoicePDF(invoice, student, invoice.items);
        invoice.pdfPath = pdfPath;
        await invoice.save();
      } catch (pdfError) {
        console.error('Error regenerating PDF:', pdfError);
      }
    }

    res.json({
      message: 'Invoice updated successfully',
      invoice
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Download invoice PDF
exports.downloadInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    if (!invoice.pdfPath) {
      return res.status(404).json({ message: 'PDF not generated yet' });
    }

    res.download(invoice.pdfPath, `invoice-${invoice.invoiceNumber}.pdf`, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        res.status(500).json({ message: 'Error downloading file' });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

