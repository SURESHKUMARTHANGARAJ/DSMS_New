const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  items: [{
    description: String,
    quantity: Number,
    unitPrice: Number,
    total: Number
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'partial', 'cancelled'],
    default: 'pending'
  },
  generatedDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date
  },
  pdfPath: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Invoice', invoiceSchema);

