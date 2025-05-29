const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// @route   GET /api/admin/dashboard
// @desc    Get dashboard statistics
// @access  Public (since authentication is handled on frontend)
router.get('/dashboard', adminController.getDashboardStats);

// @route   GET /api/admin/students
// @desc    Get all students with optional filtering
// @access  Public (since authentication is handled on frontend)
router.get('/students', adminController.getStudents);

// @route   POST /api/admin/students
// @desc    Add a new student
// @access  Public (since authentication is handled on frontend)
router.post('/students', adminController.addStudent);

// @route   POST /api/admin/students/bulk
// @desc    Add multiple students
// @access  Public (since authentication is handled on frontend)
router.post('/students/bulk', adminController.addBulkStudents);

// @route   PUT /api/admin/students/:id/status
// @desc    Update student clearance status
// @access  Public (since authentication is handled on frontend)
router.put('/students/:id/status', adminController.updateStudentStatus);

// @route   DELETE /api/admin/students/:id
// @desc    Delete a student
// @access  Public (since authentication is handled on frontend)
router.delete('/students/:id', adminController.deleteStudent);

// @route   POST /api/admin/notifications
// @desc    Send a notification to a student
// @access  Public (since authentication is handled on frontend)
router.post('/notifications', adminController.sendNotification);

module.exports = router;
