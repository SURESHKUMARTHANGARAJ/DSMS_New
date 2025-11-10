const express = require('express');
const router = express.Router();
const instructorController = require('../controllers/instructorController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// All routes require authentication
router.use(auth);

// Get instructor dashboard (Instructor only)
router.get('/dashboard', roleCheck('instructor'), instructorController.getDashboard);

// Get all instructors (Admin only)
router.get('/', roleCheck('admin'), instructorController.getAllInstructors);

// Get instructor by ID
router.get('/:id', instructorController.getInstructorById);

// Create instructor (Admin only)
router.post('/', roleCheck('admin'), instructorController.createInstructor);

// Update instructor (Admin only)
router.put('/:id', roleCheck('admin'), instructorController.updateInstructor);

// Delete instructor (Admin only)
router.delete('/:id', roleCheck('admin'), instructorController.deleteInstructor);

module.exports = router;

