const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const upload = require('../middleware/upload');

// All routes require authentication
router.use(auth);

// Get all students (Admin only)
router.get('/', roleCheck('admin', 'instructor'), studentController.getAllStudents);

// Get student by ID
router.get('/:id', studentController.getStudentById);

// Create student enrollment (Admin only)
router.post(
  '/',
  roleCheck('admin'),
  upload.fields([
    { name: 'aadharCard', maxCount: 1 },
    { name: 'panCard', maxCount: 1 }
  ]),
  studentController.createStudent
);

// Update student (Admin only)
router.put(
  '/:id',
  roleCheck('admin'),
  upload.fields([
    { name: 'aadharCard', maxCount: 1 },
    { name: 'panCard', maxCount: 1 }
  ]),
  studentController.updateStudent
);

// Enroll student in class
router.post('/:id/enroll', roleCheck('admin'), studentController.enrollInClass);

module.exports = router;

