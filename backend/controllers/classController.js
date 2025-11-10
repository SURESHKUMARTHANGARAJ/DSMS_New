const Class = require('../models/Class');
const Student = require('../models/Student');

// Get all classes
exports.getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find()
      .populate('instructor', 'userId employeeId')
      .sort({ createdAt: -1 });
    
    res.json(classes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get class by ID
exports.getClassById = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id)
      .populate('instructor', 'userId employeeId');
    
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Get enrolled students
    const students = await Student.find({ enrolledClasses: req.params.id })
      .populate('userId', 'name email phone');

    res.json({
      ...classData.toObject(),
      enrolledStudents: students
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create class
exports.createClass = async (req, res) => {
  try {
    const { name, description, duration, fees, maxStudents, instructor, status } = req.body;

    const classData = new Class({
      name,
      description,
      duration,
      fees,
      maxStudents,
      instructor,
      status
    });

    await classData.save();

    const populatedClass = await Class.findById(classData._id)
      .populate('instructor', 'userId employeeId');

    res.status(201).json({
      message: 'Class created successfully',
      class: populatedClass
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update class
exports.updateClass = async (req, res) => {
  try {
    const { name, description, duration, fees, maxStudents, instructor, status } = req.body;
    const classId = req.params.id;

    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (duration) updateData.duration = duration;
    if (fees !== undefined) updateData.fees = fees;
    if (maxStudents) updateData.maxStudents = maxStudents;
    if (instructor) updateData.instructor = instructor;
    if (status) updateData.status = status;

    const classData = await Class.findByIdAndUpdate(
      classId,
      updateData,
      { new: true, runValidators: true }
    ).populate('instructor', 'userId employeeId');

    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    res.json({
      message: 'Class updated successfully',
      class: classData
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete class
exports.deleteClass = async (req, res) => {
  try {
    const classData = await Class.findByIdAndDelete(req.params.id);
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

