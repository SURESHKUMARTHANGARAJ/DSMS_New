const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String
  },
  duration: {
    type: Number,
    required: true,
    default: 60 // in minutes
  },
  fees: {
    type: Number,
    required: true,
    default: 0
  },
  maxStudents: {
    type: Number,
    default: 10
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'completed'],
    default: 'active'
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Instructor'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Class', classSchema);

