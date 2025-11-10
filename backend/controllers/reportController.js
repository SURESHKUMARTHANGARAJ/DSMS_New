const Student = require('../models/Student');
const Instructor = require('../models/Instructor');
const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const Attendance = require('../models/Attendance');
const Schedule = require('../models/Schedule');
const Class = require('../models/Class');

// Student Reports
exports.getStudentReports = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    const filter = {};

    if (startDate || endDate) {
      filter.enrollmentDate = {};
      if (startDate) filter.enrollmentDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.enrollmentDate.$lte = end;
      }
    }
    if (status) filter.status = status;

    const students = await Student.find(filter)
      .populate('userId', 'name email phone')
      .populate('enrolledClasses', 'name fees')
      .sort({ enrollmentDate: -1 });

    // Get enrollment statistics
    const totalEnrolled = await Student.countDocuments(filter);
    const activeStudents = await Student.countDocuments({ ...filter, status: 'active' });
    const completedStudents = await Student.countDocuments({ ...filter, status: 'completed' });

    // Get payment statistics
    const studentIds = students.map(s => s._id);
    const totalRevenue = await Payment.aggregate([
      { $match: { studentId: { $in: studentIds } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      students,
      statistics: {
        totalEnrolled,
        activeStudents,
        completedStudents,
        totalRevenue: totalRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Instructor Reports
exports.getInstructorReports = async (req, res) => {
  try {
    const { instructorId, startDate, endDate } = req.query;
    const filter = {};

    if (instructorId) filter._id = instructorId;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const instructors = await Instructor.find(filter)
      .populate('userId', 'name email phone')
      .populate('assignedClasses', 'name');

    // Get schedule statistics for each instructor
    const instructorReports = await Promise.all(
      instructors.map(async (instructor) => {
        const scheduleFilter = { instructorId: instructor._id };
        if (startDate || endDate) {
          scheduleFilter.date = {};
          if (startDate) scheduleFilter.date.$gte = new Date(startDate);
          if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            scheduleFilter.date.$lte = end;
          }
        }

        const totalSchedules = await Schedule.countDocuments(scheduleFilter);
        const completedSchedules = await Schedule.countDocuments({
          ...scheduleFilter,
          status: 'completed'
        });

        const attendanceFilter = { instructorId: instructor._id };
        if (startDate || endDate) {
          attendanceFilter.date = {};
          if (startDate) attendanceFilter.date.$gte = new Date(startDate);
          if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            attendanceFilter.date.$lte = end;
          }
        }

        const presentCount = await Attendance.countDocuments({
          ...attendanceFilter,
          status: 'present'
        });
        const absentCount = await Attendance.countDocuments({
          ...attendanceFilter,
          status: 'absent'
        });

        return {
          ...instructor.toObject(),
          statistics: {
            totalSchedules,
            completedSchedules,
            presentCount,
            absentCount,
            completionRate: totalSchedules > 0 ? (completedSchedules / totalSchedules * 100).toFixed(2) : 0
          }
        };
      })
    );

    res.json({
      instructors: instructorReports,
      totalInstructors: instructors.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Financial Reports
exports.getFinancialReports = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Payment filter
    const paymentFilter = {};
    if (startDate || endDate) {
      paymentFilter.paymentDate = {};
      if (startDate) paymentFilter.paymentDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        paymentFilter.paymentDate.$lte = end;
      }
    }

    // Invoice filter
    const invoiceFilter = {};
    if (startDate || endDate) {
      invoiceFilter.generatedDate = {};
      if (startDate) invoiceFilter.generatedDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        invoiceFilter.generatedDate.$lte = end;
      }
    }

    // Total revenue
    const totalRevenue = await Payment.aggregate([
      { $match: paymentFilter },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Total invoiced
    const totalInvoiced = await Invoice.aggregate([
      { $match: invoiceFilter },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    // Payments by method
    const paymentsByMethod = await Payment.aggregate([
      { $match: paymentFilter },
      {
        $group: {
          _id: '$paymentMethod',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Invoice status breakdown
    const invoiceStatusBreakdown = await Invoice.aggregate([
      { $match: invoiceFilter },
      {
        $group: {
          _id: '$status',
          total: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Outstanding payments
    const invoices = await Invoice.find(invoiceFilter);
    let outstanding = 0;
    for (const invoice of invoices) {
      const payments = await Payment.aggregate([
        { $match: { invoiceId: invoice._id } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      const paid = payments[0]?.total || 0;
      outstanding += Math.max(0, invoice.totalAmount - paid);
    }

    // Recent payments
    const recentPayments = await Payment.find(paymentFilter)
      .populate('studentId', 'userId')
      .populate('recordedBy', 'name')
      .sort({ paymentDate: -1 })
      .limit(10);

    res.json({
      summary: {
        totalRevenue: totalRevenue[0]?.total || 0,
        totalInvoiced: totalInvoiced[0]?.total || 0,
        outstanding,
        paid: totalRevenue[0]?.total || 0
      },
      paymentsByMethod,
      invoiceStatusBreakdown,
      recentPayments
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Attendance Reports
exports.getAttendanceReports = async (req, res) => {
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

    const attendance = await Attendance.find(filter)
      .populate('studentId', 'userId')
      .populate('instructorId', 'userId employeeId')
      .populate('scheduleId', 'classId date')
      .sort({ date: -1 });

    // Statistics
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

    // Daily attendance breakdown
    const dailyBreakdown = await Attendance.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          present: {
            $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
          },
          absent: {
            $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] }
          },
          late: {
            $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    res.json({
      attendance,
      statistics: {
        total,
        breakdown: stats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {})
      },
      dailyBreakdown
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Dashboard Summary
exports.getDashboardSummary = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const activeStudents = await Student.countDocuments({ status: 'active' });
    const totalInstructors = await Instructor.countDocuments({ status: 'active' });
    const totalClasses = await Class.countDocuments({ status: 'active' });

    // Today's schedules
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const todaySchedules = await Schedule.countDocuments({
      date: { $gte: today, $lt: tomorrow }
    });

    // Recent payments
    const recentPayments = await Payment.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Pending invoices
    const pendingInvoices = await Invoice.countDocuments({ status: 'pending' });

    res.json({
      totalStudents,
      activeStudents,
      totalInstructors,
      totalClasses,
      todaySchedules,
      totalRevenue: recentPayments[0]?.total || 0,
      pendingInvoices
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

