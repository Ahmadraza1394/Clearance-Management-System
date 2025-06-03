const Student = require('../models/Student');
const bcrypt = require('bcryptjs');

// Get all students with passwords (for frontend authentication)
exports.getAllStudentsWithAuth = async (req, res) => {
  try {
    const students = await Student.find();
    
    // For each student, check if password is hashed and provide a plaintext version for frontend auth
    const studentsWithAuth = students.map(student => {
      const studentObj = student.toObject();
      
      // If the password is hashed, add a plaintext_password field for frontend auth
      // This is a temporary solution until we migrate all authentication to the backend
      if (student.password_is_hashed) {
        studentObj.plaintext_password = student.original_password || 'password123';
      }
      
      return studentObj;
    });
    
    res.json(studentsWithAuth);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Student login
exports.loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find student by email
    const student = await Student.findOne({ email });
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Check password
    if (student.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Return student data without password
    const studentData = student.toObject();
    delete studentData.password;
    
    res.json({ success: true, student: studentData });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get all students
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().select('-password');
    res.json(students);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get student by ID, user_id, or email
exports.getStudentById = async (req, res) => {
  try {
    let student;
    
    // Check if the id is an email (contains @)
    if (req.params.id.includes('@')) {
      student = await Student.findOne({ email: req.params.id }).select('-password');
    } else {
      // Try to find by _id, user_id, or roll_number
      student = await Student.findOne({
        $or: [
          { _id: req.params.id },
          { user_id: req.params.id },
          { roll_number: req.params.id }
        ]
      }).select('-password');
    }
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.json(student);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.status(500).send('Server Error');
  }
};

// Update student password
exports.updatePassword = async (req, res) => {
  try {
    console.log('Updating password for student ID:', req.params.id);
    console.log('Request body:', req.body);
    
    const { currentPassword, newPassword } = req.body;
    const studentId = req.params.id;
    
    if (!newPassword) {
      return res.status(400).json({ message: 'New password is required' });
    }
    
    // Find the student by ID, email, or user_id
    let student;
    
    try {
      // Check if the id is an email (contains @)
      if (studentId.includes('@')) {
        console.log('Looking up student by email:', studentId);
        student = await Student.findOne({ email: studentId });
      } else {
        // Try to find by _id, user_id, or roll_number
        console.log('Looking up student by ID/roll number:', studentId);
        student = await Student.findOne({
          $or: [
            { _id: studentId },
            { user_id: studentId },
            { roll_number: studentId }
          ]
        });
      }
      
      console.log('Found student:', student ? 'Yes' : 'No');
    } catch (findError) {
      console.error('Error finding student:', findError);
      return res.status(500).json({ message: 'Database error when finding student' });
    }
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    try {
      // Update the student directly using findOneAndUpdate to avoid potential save issues
      const updatedStudent = await Student.findOneAndUpdate(
        { _id: student._id },
        {
          $set: {
            password: newPassword, // Store as plaintext for now to ensure frontend auth works
            original_password: newPassword,
            password_is_hashed: false // We're not hashing for now to ensure it works
          }
        },
        { new: true }
      );
      
      if (!updatedStudent) {
        return res.status(500).json({ message: 'Failed to update student password' });
      }
      
      console.log('Password updated successfully');
      return res.json({ success: true, message: 'Password updated successfully' });
    } catch (updateError) {
      console.error('Error updating student password:', updateError);
      return res.status(500).json({ message: 'Database error when updating password' });
    }
  } catch (err) {
    console.error('Error in password update process:', err);
    return res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

// Create a new student
exports.createStudent = async (req, res) => {
  try {
    const { name, email, password, roll_number, user_id } = req.body;
    
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
    
    // Store the original password for frontend authentication
    const originalPassword = password;
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new student
    student = new Student({
      name,
      email,
      password: hashedPassword,
      original_password: originalPassword, // Store original password for frontend auth
      password_is_hashed: true, // Flag to indicate password is hashed
      roll_number,
      user_id: user_id || Date.now().toString(),
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
    
    // Return the student without the password
    const studentResponse = student.toObject();
    delete studentResponse.password;
    
    res.json(studentResponse);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Update student password
exports.updatePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    
    // Find student by id, user_id, or email
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
    
    // Update password
    student.password = newPassword;
    await student.save();
    
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Add document metadata to a department
exports.addDocumentMetadata = async (req, res) => {
  try {
    const { id, department } = req.params;
    const { document } = req.body; // Extract document from request body
    
    if (!document) {
      return res.status(400).json({ message: 'Document data is required' });
    }
    
    console.log('Received document data:', document);
    console.log('For student ID:', id);
    console.log('Department:', department);
    
    // Find student
    let student = await Student.findOne({
      $or: [
        { _id: id },
        { user_id: id },
        { email: id }
      ]
    });
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Check if department is valid
    const validDepartments = ['dispensary', 'hostel', 'due', 'library', 'academic_department', 'alumni'];
    if (!validDepartments.includes(department)) {
      return res.status(400).json({ message: 'Invalid department' });
    }
    
    // Initialize documents object if it doesn't exist
    if (!student.documents) {
      student.documents = {};
    }
    
    // Add document to the department
    if (!student.documents[department]) {
      student.documents[department] = [];
    }
    
    // Ensure document has an id
    const documentToAdd = {
      ...document,
      id: document.id || document.public_id || `doc-${Date.now()}`
    };
    
    student.documents[department].push(documentToAdd);
    await student.save();
    
    res.json(student.documents[department]);
  } catch (err) {
    console.error('Error adding document metadata:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

// Delete a document from a department
exports.deleteDocument = async (req, res) => {
  try {
    const { id, department, documentId } = req.params;
    
    console.log('Deleting document:', documentId);
    console.log('From department:', department);
    console.log('For student ID:', id);
    
    // Find student
    let student = await Student.findOne({
      $or: [
        { _id: id },
        { user_id: id },
        { email: id }
      ]
    });
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Check if department is valid
    const validDepartments = ['dispensary', 'hostel', 'due', 'library', 'academic_department', 'alumni'];
    if (!validDepartments.includes(department)) {
      return res.status(400).json({ message: 'Invalid department' });
    }
    
    // Initialize documents object if it doesn't exist
    if (!student.documents) {
      student.documents = {};
      return res.json({ message: 'No documents found to delete' });
    }
    
    // Remove document from the department
    if (student.documents[department]) {
      const originalLength = student.documents[department].length;
      student.documents[department] = student.documents[department].filter(
        doc => (doc.id !== documentId && doc.public_id !== documentId)
      );
      
      // Check if any document was actually removed
      if (originalLength === student.documents[department].length) {
        console.log('No document found with ID:', documentId);
        return res.status(404).json({ message: 'Document not found' });
      }
      
      await student.save();
      console.log('Document deleted successfully');
    } else {
      console.log('Department has no documents:', department);
      return res.status(404).json({ message: 'No documents found in this department' });
    }
    
    res.json({ 
      message: 'Document deleted successfully',
      remainingDocuments: student.documents[department] 
    });
  } catch (err) {
    console.error('Error deleting document:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

// Check if a student is fully cleared
exports.isStudentCleared = async (req, res) => {
  try {
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
    
    // Check if all clearance statuses are true
    const isCleared = Object.values(student.clearance_status).every(status => status === true);
    
    res.json({ isCleared });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Verify a student's certificate by ID, roll number, or email
exports.verifyCertificate = async (req, res) => {
  try {
    console.log('Verifying certificate for ID:', req.params.id);
    
    // Find student by id, user_id, roll_number, or email
    let student = await Student.findOne({
      $or: [
        { _id: req.params.id },
        { user_id: req.params.id },
        { roll_number: req.params.id },
        { email: req.params.id }
      ]
    }).select('-password');
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Check if all clearance statuses are true
    const isCleared = Object.values(student.clearance_status).every(status => status === true);
    
    // Return student data with clearance status
    res.json({
      student: student,
      isCleared: isCleared,
      verificationDate: new Date()
    });
  } catch (err) {
    console.error('Certificate verification error:', err.message);
    res.status(500).send('Server Error');
  }
};
