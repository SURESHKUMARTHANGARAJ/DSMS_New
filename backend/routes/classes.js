const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// All routes require authentication
router.use(auth);

// Get all classes
router.get('/', classController.getAllClasses);

// Get class by ID
router.get('/:id', classController.getClassById);

// Create class (Admin only)
router.post('/', roleCheck('admin'), classController.createClass);

// Update class (Admin only)
router.put('/:id', roleCheck('admin'), classController.updateClass);

// Delete class (Admin only)
router.delete('/:id', roleCheck('admin'), classController.deleteClass);

module.exports = router;

