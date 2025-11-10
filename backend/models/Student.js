const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  aadharCardPath: {
    type: String
  },
  panCardPath: {
    type: String
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  dateOfBirth: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'completed', 'suspended'],
    default: 'active'
  },
  enrolledClasses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Student', studentSchema);

