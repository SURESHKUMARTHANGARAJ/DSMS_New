const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// All routes require authentication
router.use(auth);

// Get all attendance records
router.get('/', attendanceController.getAllAttendance);

// Get attendance statistics
router.get('/stats', attendanceController.getAttendanceStats);

// Get attendance by ID
router.get('/:id', attendanceController.getAttendanceById);

// Instructor login tracking
router.post('/instructor/login', roleCheck('instructor'), attendanceController.instructorLogin);

// Instructor logout tracking
router.post('/instructor/logout', roleCheck('instructor'), attendanceController.instructorLogout);

// Mark attendance (Admin, Instructor)
router.post('/', roleCheck('admin', 'instructor'), attendanceController.markAttendance);

// Update attendance (Admin, Instructor)
router.put('/:id', roleCheck('admin', 'instructor'), attendanceController.updateAttendance);

module.exports = router;

