const Payment = require('../models/Payment');
const Student = require('../models/Student');
const Invoice = require('../models/Invoice');

// Get all payments
exports.getAllPayments = async (req, res) => {
  try {
    const { studentId, startDate, endDate } = req.query;
    const filter = {};

    if (studentId) filter.studentId = studentId;
    if (startDate || endDate) {
      filter.paymentDate = {};
      if (startDate) filter.paymentDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.paymentDate.$lte = end;
      }
    }

    const payments = await Payment.find(filter)
      .populate('studentId', 'userId')
      .populate('invoiceId', 'invoiceNumber')
      .populate('recordedBy', 'name')
      .sort({ paymentDate: -1 });

    // Populate student user details
    for (let payment of payments) {
      if (payment.studentId && payment.studentId.userId) {
        await payment.populate('studentId.userId', 'name email');
      }
    }

    res.json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get payment by ID
exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('studentId', 'userId')
      .populate('invoiceId', 'invoiceNumber totalAmount')
      .populate('recordedBy', 'name email');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.studentId && payment.studentId.userId) {
      await payment.populate('studentId.userId', 'name email phone');
    }

    res.json(payment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create payment
exports.createPayment = async (req, res) => {
  try {
    const { studentId, amount, paymentDate, paymentMethod, description, invoiceId } = req.body;

    // Validate student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const payment = new Payment({
      studentId,
      amount,
      paymentDate: paymentDate || new Date(),
      paymentMethod: paymentMethod || 'cash',
      description,
      invoiceId,
      recordedBy: req.user.userId
    });

    await payment.save();

    // Update invoice status if invoiceId provided
    if (invoiceId) {
      const invoice = await Invoice.findById(invoiceId);
      if (invoice) {
        const totalPaid = await Payment.aggregate([
          { $match: { invoiceId: invoice._id } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const paidAmount = totalPaid[0]?.total || 0;
        if (paidAmount >= invoice.totalAmount) {
          invoice.status = 'paid';
        } else if (paidAmount > 0) {
          invoice.status = 'partial';
        }
        await invoice.save();
      }
    }

    const populatedPayment = await Payment.findById(payment._id)
      .populate('studentId', 'userId')
      .populate('invoiceId', 'invoiceNumber')
      .populate('recordedBy', 'name');

    res.status(201).json({
      message: 'Payment recorded successfully',
      payment: populatedPayment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update payment
exports.updatePayment = async (req, res) => {
  try {
    const { amount, paymentDate, paymentMethod, description } = req.body;
    const paymentId = req.params.id;

    const updateData = {};
    if (amount) updateData.amount = amount;
    if (paymentDate) updateData.paymentDate = paymentDate;
    if (paymentMethod) updateData.paymentMethod = paymentMethod;
    if (description !== undefined) updateData.description = description;

    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('studentId', 'userId')
      .populate('invoiceId', 'invoiceNumber');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json({
      message: 'Payment updated successfully',
      payment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete payment
exports.deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

