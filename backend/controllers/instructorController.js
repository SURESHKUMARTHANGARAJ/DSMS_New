const Instructor = require('../models/Instructor');
const User = require('../models/User');
const Schedule = require('../models/Schedule');
const Attendance = require('../models/Attendance');

// Get all instructors
exports.getAllInstructors = async (req, res) => {
  try {
    const instructors = await Instructor.find()
      .populate('userId', 'name email phone')
      .populate('assignedClasses', 'name')
      .sort({ createdAt: -1 });
    
    res.json(instructors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get instructor by ID
exports.getInstructorById = async (req, res) => {
  try {
    // Try to find by instructor _id first, then by userId
    let instructor = await Instructor.findById(req.params.id)
      .populate('userId', 'name email phone')
      .populate('assignedClasses', 'name fees duration');
    
    if (!instructor) {
      instructor = await Instructor.findOne({ userId: req.params.id })
        .populate('userId', 'name email phone')
        .populate('assignedClasses', 'name fees duration');
    }
    
    if (!instructor) {
      return res.status(404).json({ message: 'Instructor not found' });
    }

    // Get schedules
    const schedules = await Schedule.find({ instructorId: instructor._id })
      .populate('studentId', 'userId')
      .populate('classId', 'name')
      .sort({ date: 1 });

    res.json({
      ...instructor.toObject(),
      schedules
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create instructor
exports.createInstructor = async (req, res) => {
  try {
    const { userId, employeeId, specialization, licenseNumber, experience } = req.body;

    // Check if instructor already exists
    const existingInstructor = await Instructor.findOne({ userId });
    if (existingInstructor) {
      return res.status(400).json({ message: 'Instructor already exists' });
    }

    // Check if employeeId is unique
    const existingEmployeeId = await Instructor.findOne({ employeeId });
    if (existingEmployeeId) {
      return res.status(400).json({ message: 'Employee ID already exists' });
    }

    const instructor = new Instructor({
      userId,
      employeeId,
      specialization,
      licenseNumber,
      experience
    });

    await instructor.save();

    const populatedInstructor = await Instructor.findById(instructor._id)
      .populate('userId', 'name email phone');

    res.status(201).json({
      message: 'Instructor created successfully',
      instructor: populatedInstructor
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update instructor
exports.updateInstructor = async (req, res) => {
  try {
    const { specialization, licenseNumber, experience, status } = req.body;
    const instructorId = req.params.id;

    const updateData = {};
    if (specialization) updateData.specialization = specialization;
    if (licenseNumber) updateData.licenseNumber = licenseNumber;
    if (experience !== undefined) updateData.experience = experience;
    if (status) updateData.status = status;

    const instructor = await Instructor.findByIdAndUpdate(
      instructorId,
      updateData,
      { new: true, runValidators: true }
    ).populate('userId', 'name email phone');

    if (!instructor) {
      return res.status(404).json({ message: 'Instructor not found' });
    }

    res.json({
      message: 'Instructor updated successfully',
      instructor
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete instructor
exports.deleteInstructor = async (req, res) => {
  try {
    const instructor = await Instructor.findByIdAndDelete(req.params.id);
    if (!instructor) {
      return res.status(404).json({ message: 'Instructor not found' });
    }

    res.json({ message: 'Instructor deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get instructor dashboard data
exports.getDashboard = async (req, res) => {
  try {
    const instructor = await Instructor.findOne({ userId: req.user.userId });
    if (!instructor) {
      return res.status(404).json({ message: 'Instructor not found' });
    }

    // Get today's schedules
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaySchedules = await Schedule.find({
      instructorId: instructor._id,
      date: { $gte: today, $lt: tomorrow }
    })
      .populate('studentId', 'userId')
      .populate('classId', 'name')
      .sort({ startTime: 1 });

    // Get upcoming schedules
    const upcomingSchedules = await Schedule.find({
      instructorId: instructor._id,
      date: { $gte: tomorrow },
      status: 'scheduled'
    })
      .populate('studentId', 'userId')
      .populate('classId', 'name')
      .sort({ date: 1, startTime: 1 })
      .limit(10);

    // Get attendance stats
    const attendanceStats = await Attendance.aggregate([
      { $match: { instructorId: instructor._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      instructor,
      todaySchedules,
      upcomingSchedules,
      attendanceStats
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

