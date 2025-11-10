const Attendance = require('../models/Attendance');
const Schedule = require('../models/Schedule');
const Instructor = require('../models/Instructor');
const Student = require('../models/Student');

// Get all attendance records
exports.getAllAttendance = async (req, res) => {
  try {
    const { studentId, instructorId, date, status } = req.query;
    const filter = {};

    if (studentId) filter.studentId = studentId;
    if (instructorId) filter.instructorId = instructorId;
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      filter.date = { $gte: startDate, $lte: endDate };
    }
    if (status) filter.status = status;

    const attendance = await Attendance.find(filter)
      .populate('studentId', 'userId')
      .populate('scheduleId', 'classId date startTime endTime')
      .populate('instructorId', 'userId employeeId')
      .sort({ date: -1 });

    // Populate nested details
    for (let record of attendance) {
      if (record.studentId && record.studentId.userId) {
        await record.populate('studentId.userId', 'name email');
      }
      if (record.instructorId && record.instructorId.userId) {
        await record.populate('instructorId.userId', 'name email');
      }
      if (record.scheduleId && record.scheduleId.classId) {
        await record.populate('scheduleId.classId', 'name');
      }
    }

    res.json(attendance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get attendance by ID
exports.getAttendanceById = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id)
      .populate('studentId', 'userId')
      .populate('scheduleId', 'classId date startTime endTime')
      .populate('instructorId', 'userId employeeId');

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    if (attendance.studentId && attendance.studentId.userId) {
      await attendance.populate('studentId.userId', 'name email phone');
    }
    if (attendance.instructorId && attendance.instructorId.userId) {
      await attendance.populate('instructorId.userId', 'name email phone');
    }

    res.json(attendance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark attendance for student
exports.markAttendance = async (req, res) => {
  try {
    const { studentId, scheduleId, instructorId, date, status, notes } = req.body;

    // Validate instructor exists
    const instructor = await Instructor.findById(instructorId);
    if (!instructor) {
      return res.status(404).json({ message: 'Instructor not found' });
    }

    // If scheduleId provided, validate it
    if (scheduleId) {
      const schedule = await Schedule.findById(scheduleId);
      if (!schedule) {
        return res.status(404).json({ message: 'Schedule not found' });
      }
    }

    // If studentId provided, validate it
    if (studentId) {
      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
    }

    const attendance = new Attendance({
      studentId,
      scheduleId,
      instructorId,
      date: date || new Date(),
      status: status || 'present',
      notes
    });

    await attendance.save();

    const populatedAttendance = await Attendance.findById(attendance._id)
      .populate('studentId', 'userId')
      .populate('scheduleId', 'classId date')
      .populate('instructorId', 'userId employeeId');

    res.status(201).json({
      message: 'Attendance marked successfully',
      attendance: populatedAttendance
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update attendance
exports.updateAttendance = async (req, res) => {
  try {
    const { status, notes, loginTime, logoutTime } = req.body;
    const attendanceId = req.params.id;

    const updateData = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (loginTime) updateData.loginTime = new Date(loginTime);
    if (logoutTime) updateData.logoutTime = new Date(logoutTime);

    const attendance = await Attendance.findByIdAndUpdate(
      attendanceId,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('studentId', 'userId')
      .populate('scheduleId', 'classId date')
      .populate('instructorId', 'userId employeeId');

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    res.json({
      message: 'Attendance updated successfully',
      attendance
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Instructor login/logout tracking
exports.instructorLogin = async (req, res) => {
  try {
    const instructor = await Instructor.findOne({ userId: req.user.userId });
    if (!instructor) {
      return res.status(404).json({ message: 'Instructor not found' });
    }

    // Create or update attendance record for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let attendance = await Attendance.findOne({
      instructorId: instructor._id,
      date: { $gte: today, $lt: tomorrow },
      studentId: null
    });

    if (!attendance) {
      attendance = new Attendance({
        instructorId: instructor._id,
        date: new Date(),
        status: 'present'
      });
    }

    attendance.loginTime = new Date();
    await attendance.save();

    res.json({
      message: 'Login time recorded',
      attendance
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.instructorLogout = async (req, res) => {
  try {
    const instructor = await Instructor.findOne({ userId: req.user.userId });
    if (!instructor) {
      return res.status(404).json({ message: 'Instructor not found' });
    }

    // Find today's attendance record
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const attendance = await Attendance.findOne({
      instructorId: instructor._id,
      date: { $gte: today, $lt: tomorrow },
      studentId: null
    });

    if (!attendance) {
      return res.status(404).json({ message: 'No login record found for today' });
    }

    attendance.logoutTime = new Date();
    await attendance.save();

    res.json({
      message: 'Logout time recorded',
      attendance
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get attendance statistics
exports.getAttendanceStats = async (req, res) => {
  try {
    const { studentId, instructorId, startDate, endDate } = req.query;
    const filter = {};

    if (studentId) filter.studentId = studentId;
    if (instructorId) filter.instructorId = instructorId;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    const stats = await Attendance.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const total = await Attendance.countDocuments(filter);

    res.json({
      stats,
      total,
      breakdown: stats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {})
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

