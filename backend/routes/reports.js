const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// All routes require authentication
router.use(auth);

// Dashboard summary (All roles)
router.get('/dashboard', reportController.getDashboardSummary);

// Student reports (Admin only)
router.get('/students', roleCheck('admin'), reportController.getStudentReports);

// Instructor reports (Admin only)
router.get('/instructors', roleCheck('admin'), reportController.getInstructorReports);

// Financial reports (Admin only)
router.get('/financial', roleCheck('admin'), reportController.getFinancialReports);

// Attendance reports
router.get('/attendance', roleCheck('admin', 'instructor'), reportController.getAttendanceReports);

module.exports = router;

