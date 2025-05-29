const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// @route   GET /api/notifications/student/:student_id
// @desc    Get all notifications for a student
// @access  Public (since authentication is handled on frontend)
router.get('/student/:student_id', notificationController.getStudentNotifications);

// @route   POST /api/notifications
// @desc    Create a new notification
// @access  Public (since authentication is handled on frontend)
router.post('/', notificationController.createNotification);

// @route   POST /api/notifications/clearance
// @desc    Create a clearance completion notification
// @access  Public (since authentication is handled on frontend)
router.post('/clearance', notificationController.createClearanceNotification);

// @route   PUT /api/notifications/:id/read
// @desc    Mark a notification as read
// @access  Public (since authentication is handled on frontend)
router.put('/:id/read', notificationController.markAsRead);

// @route   DELETE /api/notifications/:id
// @desc    Delete a notification
// @access  Public (since authentication is handled on frontend)
router.delete('/:id', notificationController.deleteNotification);

// @route   GET /api/notifications/student/:student_id/unread
// @desc    Get unread notification count for a student
// @access  Public (since authentication is handled on frontend)
router.get('/student/:student_id/unread', notificationController.getUnreadCount);

module.exports = router;
