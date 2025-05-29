const Notification = require('../models/Notification');
const Student = require('../models/Student');

// Get notifications for a student
exports.getStudentNotifications = async (req, res) => {
  try {
    const studentId = req.params.student_id;
    
    // Find student
    const student = await Student.findOne({
      $or: [
        { _id: studentId },
        { user_id: studentId },
        { email: studentId }
      ]
    });
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Get notifications for this student
    const notifications = await Notification.find({ 
      student_id: student._id 
    }).sort({ created_at: -1 });
    
    res.json(notifications);
  } catch (err) {
    console.error('Error fetching notifications:', err.message);
    res.status(500).send('Server Error');
  }
};

// Create a new notification
exports.createNotification = async (req, res) => {
  try {
    const { student_id, title, message, type } = req.body;
    
    // Find student
    const student = await Student.findOne({
      $or: [
        { _id: student_id },
        { user_id: student_id },
        { email: student_id }
      ]
    });
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Create notification
    const notification = new Notification({
      student_id: student._id,
      title,
      message,
      type: type || 'message'
    });
    
    await notification.save();
    
    res.json(notification);
  } catch (err) {
    console.error('Error creating notification:', err.message);
    res.status(500).send('Server Error');
  }
};

// Create clearance complete notification
exports.createClearanceNotification = async (req, res) => {
  try {
    const { student_id } = req.body;
    
    // Find student
    const student = await Student.findOne({
      $or: [
        { _id: student_id },
        { user_id: student_id },
        { email: student_id }
      ]
    });
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Check if student is fully cleared
    const isCleared = Object.values(student.clearance_status).every(status => status === true);
    
    if (!isCleared) {
      return res.status(400).json({ message: 'Student is not fully cleared yet' });
    }
    
    // Create notification
    const notification = new Notification({
      student_id: student._id,
      title: 'Clearance Completed',
      message: 'Congratulations! All your clearance items have been completed. You can now download your clearance certificate.',
      type: 'clearance'
    });
    
    await notification.save();
    
    res.json(notification);
  } catch (err) {
    console.error('Error creating clearance notification:', err.message);
    res.status(500).send('Server Error');
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;
    
    // Find and update notification
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { is_read: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json(notification);
  } catch (err) {
    console.error('Error marking notification as read:', err.message);
    res.status(500).send('Server Error');
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    const notificationId = req.params.id;
    
    // Find and delete notification
    const notification = await Notification.findByIdAndDelete(notificationId);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json({ message: 'Notification deleted successfully' });
  } catch (err) {
    console.error('Error deleting notification:', err.message);
    res.status(500).send('Server Error');
  }
};

// Get unread notification count for a student
exports.getUnreadCount = async (req, res) => {
  try {
    const studentId = req.params.student_id;
    
    // Find student
    const student = await Student.findOne({
      $or: [
        { _id: studentId },
        { user_id: studentId },
        { email: studentId }
      ]
    });
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Count unread notifications
    const count = await Notification.countDocuments({ 
      student_id: student._id,
      is_read: false
    });
    
    res.json({ count });
  } catch (err) {
    console.error('Error counting unread notifications:', err.message);
    res.status(500).send('Server Error');
  }
};
