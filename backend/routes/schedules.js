const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// All routes require authentication
router.use(auth);

// Get all schedules
router.get('/', scheduleController.getAllSchedules);

// Get schedule by ID
router.get('/:id', scheduleController.getScheduleById);

// Create schedule (Admin only)
router.post('/', roleCheck('admin'), scheduleController.createSchedule);

// Update schedule (Admin, Instructor)
router.put('/:id', roleCheck('admin', 'instructor'), scheduleController.updateSchedule);

// Delete schedule (Admin only)
router.delete('/:id', roleCheck('admin'), scheduleController.deleteSchedule);

module.exports = router;

