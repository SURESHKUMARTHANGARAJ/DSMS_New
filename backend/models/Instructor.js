const mongoose = require('mongoose');

const instructorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  specialization: {
    type: String
  },
  licenseNumber: {
    type: String
  },
  experience: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'on-leave'],
    default: 'active'
  },
  assignedClasses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Instructor', instructorSchema);

