const Student = require('../models/Student');
const Notification = require('../models/Notification');

// Send notification to a student
exports.sendNotification = async (req, res) => {
  try {
    const { student_id, title, message } = req.body;
    
    // Validate input
    if (!student_id || !title || !message) {
      return res.status(400).json({ message: 'Student ID, title, and message are required' });
    }
    
    // Find student
    const student = await Student.findOne({
      $or: [
        { _id: student_id },
        { user_id: student_id },
        { email: student_id },
        { roll_number: student_id }
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
      type: 'message'
    });
    
    await notification.save();
    
    res.json(notification);
  } catch (err) {
    console.error('Error sending notification:', err.message);
    res.status(500).send('Server Error');
  }
};

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    // Get all students
    const students = await Student.find();
    
    // Calculate statistics
    const totalStudents = students.length;
    
    // Count students with all clearances
    const clearedStudents = students.filter(student => 
      Object.values(student.clearance_status).every(status => status === true)
    ).length;
    
    // Count pending students
    const pendingStudents = totalStudents - clearedStudents;
    
    // Calculate clearance rate
    const clearanceRate = totalStudents > 0 
      ? Math.round((clearedStudents / totalStudents) * 100) 
      : 0;
    
    // Return statistics
    res.json({
      totalStudents,
      clearedStudents,
      pendingStudents,
      clearanceRate,
      lastUpdate: new Date().toISOString()
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get all students with optional filtering
exports.getStudents = async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};
    
    // Search by name or roll number if provided
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { roll_number: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    // Get students
    let students = await Student.find(query).select('-password');
    
    // Filter by clearance status if needed
    if (status === 'cleared') {
      students = students.filter(student => 
        Object.values(student.clearance_status).every(status => status === true)
      );
    } else if (status === 'pending') {
      students = students.filter(student => 
        !Object.values(student.clearance_status).every(status => status === true)
      );
    }
    
    res.json(students);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Delete a student
exports.deleteStudent = async (req, res) => {
  try {
    const studentId = req.params.id;
    
    // Find and delete the student
    const student = await Student.findByIdAndDelete(studentId);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Add a new student
exports.addStudent = async (req, res) => {
  try {
    const { name, email, roll_number, clearance_status } = req.body;
    
    // Check if student already exists
    let student = await Student.findOne({ 
      $or: [
        { email },
        { roll_number }
      ]
    });
    
    if (student) {
      return res.status(400).json({ message: 'Student with this email or roll number already exists' });
    }
    
    // Create new student with default password
    student = new Student({
      name,
      email,
      password: 'student123', // Default password
      roll_number,
      user_id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      role: 'student',
      clearance_status: clearance_status || {
        dispensary: false,
        hostel: false,
        due: false,
        library: false,
        academic_department: false,
        alumni: false
      },
      documents: {
        dispensary: [],
        hostel: [],
        due: [],
        library: [],
        academic_department: [],
        alumni: []
      }
    });
    
    await student.save();
    
    // Return the student without the password
    const studentResponse = student.toObject();
    delete studentResponse.password;
    
    res.json(studentResponse);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Add multiple students
exports.addBulkStudents = async (req, res) => {
  try {
    const { students: newStudents } = req.body;
    
    if (!Array.isArray(newStudents) || newStudents.length === 0) {
      return res.status(400).json({ message: 'No students provided' });
    }
    
    const results = {
      added: 0,
      skipped: 0,
      students: []
    };
    
    // Process each student
    for (const studentData of newStudents) {
      const { name, email, roll_number } = studentData;
      
      // Check if required fields are present
      if (!name || !email || !roll_number) {
        results.skipped++;
        continue;
      }
      
      // Check if student already exists
      const existingStudent = await Student.findOne({ 
        $or: [
          { email },
          { roll_number }
        ]
      });
      
      if (existingStudent) {
        results.skipped++;
        continue;
      }
      
      // Create new student
      const student = new Student({
        name,
        email,
        password: 'student123', // Default password
        roll_number,
        user_id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        role: 'student',
        clearance_status: {
          dispensary: false,
          hostel: false,
          due: false,
          library: false,
          academic_department: false,
          alumni: false
        },
        documents: {
          dispensary: [],
          hostel: [],
          due: [],
          library: [],
          academic_department: [],
          alumni: []
        }
      });
      
      await student.save();
      
      // Add to results
      results.added++;
      
      // Add to students list without password
      const studentResponse = student.toObject();
      delete studentResponse.password;
      results.students.push(studentResponse);
    }
    
    res.json(results);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Update student clearance status
exports.updateStudentStatus = async (req, res) => {
  try {
    const { clearance_status, notification_message } = req.body;
    
    // Find student
    let student = await Student.findOne({
      $or: [
        { _id: req.params.id },
        { user_id: req.params.id },
        { email: req.params.id }
      ]
    });
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Store previous clearance status to check what changed
    const previousStatus = { ...student.clearance_status };
    
    // Update clearance status
    student.clearance_status = {
      ...student.clearance_status,
      ...clearance_status
    };
    
    // Check if all clearances are complete
    const allCleared = Object.values(student.clearance_status).every(status => status === true);
    
    // Update clearance date if all cleared
    if (allCleared && !student.clearance_date) {
      student.clearance_date = new Date();
    } else if (!allCleared && student.clearance_date) {
      student.clearance_date = null;
    }
    
    await student.save();
    
    // Create notifications for status changes
    const changedDepartments = [];
    for (const [dept, status] of Object.entries(clearance_status)) {
      if (previousStatus[dept] !== status) {
        changedDepartments.push({
          name: dept.replace('_', ' '),
          status: status
        });
      }
    }
    
    if (changedDepartments.length > 0) {
      // Create notification about status changes
      const deptMessages = changedDepartments.map(dept => 
        `${dept.name.charAt(0).toUpperCase() + dept.name.slice(1)}: ${dept.status ? 'Cleared' : 'Not Cleared'}`
      );
      
      const notification = new Notification({
        student_id: student._id,
        title: 'Clearance Status Updated',
        message: notification_message || `Your clearance status has been updated:\n${deptMessages.join('\n')}`,
        type: 'message'
      });
      
      await notification.save();
    }
    
    // If all cleared, create a special notification
    if (allCleared && !previousStatus.dispensary && !previousStatus.hostel && 
        !previousStatus.due && !previousStatus.library && 
        !previousStatus.academic_department && !previousStatus.alumni) {
      const clearanceNotification = new Notification({
        student_id: student._id,
        title: 'Clearance Completed',
        message: 'Congratulations! All your clearance items have been completed. You can now download your clearance certificate.',
        type: 'clearance'
      });
      
      await clearanceNotification.save();
    }
    
    res.json(student);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Delete a student
exports.deleteStudent = async (req, res) => {
  try {
    // Find student
    const student = await Student.findOne({
      $or: [
        { _id: req.params.id },
        { user_id: req.params.id },
        { email: req.params.id }
      ]
    });
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Delete student
    await Student.findByIdAndDelete(student._id);
    
    // Delete all notifications for this student
    await Notification.deleteMany({ student_id: student._id });
    
    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
