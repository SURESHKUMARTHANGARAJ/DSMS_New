const Student = require('../models/Student');
const User = require('../models/User');
const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');

// Get all students
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find()
      .populate('userId', 'name email phone')
      .populate('enrolledClasses', 'name fees')
      .sort({ createdAt: -1 });
    
    res.json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get student by ID
exports.getStudentById = async (req, res) => {
  try {
    // Try to find by student _id first, then by userId
    let student = await Student.findById(req.params.id)
      .populate('userId', 'name email phone')
      .populate('enrolledClasses', 'name fees duration');
    
    if (!student) {
      student = await Student.findOne({ userId: req.params.id })
        .populate('userId', 'name email phone')
        .populate('enrolledClasses', 'name fees duration');
    }
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Get payment history
    const payments = await Payment.find({ studentId: student._id })
      .sort({ paymentDate: -1 });
    
    // Get invoices
    const invoices = await Invoice.find({ studentId: student._id })
      .sort({ generatedDate: -1 });

    // Calculate total paid and outstanding
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalInvoiced = invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
    const outstanding = totalInvoiced - totalPaid;

    res.json({
      ...student.toObject(),
      payments,
      invoices,
      totalPaid,
      totalInvoiced,
      outstanding
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create student enrollment
exports.createStudent = async (req, res) => {
  try {
    let { userId, address, dateOfBirth } = req.body;

    // Parse address if it's a string
    if (typeof address === 'string') {
      try {
        address = JSON.parse(address);
      } catch (e) {
        // If parsing fails, keep as is
      }
    }

    // Check if student already exists
    const existingStudent = await Student.findOne({ userId });
    if (existingStudent) {
      return res.status(400).json({ message: 'Student already enrolled' });
    }

    const studentData = {
      userId,
      address: address || {},
      dateOfBirth
    };

    // Add document paths if uploaded
    if (req.files) {
      if (req.files.aadharCard) {
        studentData.aadharCardPath = req.files.aadharCard[0].path;
      }
      if (req.files.panCard) {
        studentData.panCardPath = req.files.panCard[0].path;
      }
    }

    const student = new Student(studentData);
    await student.save();

    const populatedStudent = await Student.findById(student._id)
      .populate('userId', 'name email phone');

    res.status(201).json({
      message: 'Student enrolled successfully',
      student: populatedStudent
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update student
exports.updateStudent = async (req, res) => {
  try {
    const { address, dateOfBirth, status } = req.body;
    const studentId = req.params.id;

    const updateData = {};
    if (address) updateData.address = address;
    if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;
    if (status) updateData.status = status;

    // Update documents if new files uploaded
    if (req.files) {
      if (req.files.aadharCard) {
        updateData.aadharCardPath = req.files.aadharCard[0].path;
      }
      if (req.files.panCard) {
        updateData.panCardPath = req.files.panCard[0].path;
      }
    }

    const student = await Student.findByIdAndUpdate(
      studentId,
      updateData,
      { new: true, runValidators: true }
    ).populate('userId', 'name email phone');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({
      message: 'Student updated successfully',
      student
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Enroll student in class
exports.enrollInClass = async (req, res) => {
  try {
    const { classId } = req.body;
    const studentId = req.params.id;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (!student.enrolledClasses.includes(classId)) {
      student.enrolledClasses.push(classId);
      await student.save();
    }

    res.json({
      message: 'Student enrolled in class successfully',
      student
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

