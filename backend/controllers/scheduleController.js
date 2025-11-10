const Schedule = require('../models/Schedule');
const Student = require('../models/Student');
const Instructor = require('../models/Instructor');

// Get all schedules
exports.getAllSchedules = async (req, res) => {
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

    const schedules = await Schedule.find(filter)
      .populate('studentId', 'userId')
      .populate('classId', 'name fees duration')
      .populate('instructorId', 'userId employeeId')
      .sort({ date: 1, startTime: 1 });

    // Populate student user details
    for (let schedule of schedules) {
      if (schedule.studentId && schedule.studentId.userId) {
        await schedule.populate('studentId.userId', 'name email phone');
      }
      if (schedule.instructorId && schedule.instructorId.userId) {
        await schedule.populate('instructorId.userId', 'name email phone');
      }
    }

    res.json(schedules);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get schedule by ID
exports.getScheduleById = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id)
      .populate('studentId', 'userId')
      .populate('classId', 'name fees duration')
      .populate('instructorId', 'userId employeeId');

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    if (schedule.studentId && schedule.studentId.userId) {
      await schedule.populate('studentId.userId', 'name email phone');
    }
    if (schedule.instructorId && schedule.instructorId.userId) {
      await schedule.populate('instructorId.userId', 'name email phone');
    }

    res.json(schedule);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create schedule
exports.createSchedule = async (req, res) => {
  try {
    const { studentId, classId, instructorId, date, startTime, endTime, notes } = req.body;

    // Validate student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Validate instructor exists
    const instructor = await Instructor.findById(instructorId);
    if (!instructor) {
      return res.status(404).json({ message: 'Instructor not found' });
    }

    const schedule = new Schedule({
      studentId,
      classId,
      instructorId,
      date,
      startTime,
      endTime,
      notes
    });

    await schedule.save();

    const populatedSchedule = await Schedule.findById(schedule._id)
      .populate('studentId', 'userId')
      .populate('classId', 'name')
      .populate('instructorId', 'userId employeeId');

    res.status(201).json({
      message: 'Schedule created successfully',
      schedule: populatedSchedule
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update schedule
exports.updateSchedule = async (req, res) => {
  try {
    const { date, startTime, endTime, status, notes } = req.body;
    const scheduleId = req.params.id;

    const updateData = {};
    if (date) updateData.date = date;
    if (startTime) updateData.startTime = startTime;
    if (endTime) updateData.endTime = endTime;
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    const schedule = await Schedule.findByIdAndUpdate(
      scheduleId,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('studentId', 'userId')
      .populate('classId', 'name')
      .populate('instructorId', 'userId employeeId');

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    res.json({
      message: 'Schedule updated successfully',
      schedule
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete schedule
exports.deleteSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndDelete(req.params.id);
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

