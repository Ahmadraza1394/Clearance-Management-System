const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

// @route   GET /api/students/auth
// @desc    Get all students with passwords for frontend authentication
// @access  Public (since authentication is handled on frontend)
router.get('/auth', studentController.getAllStudentsWithAuth);

// @route   POST /api/students/login
// @desc    Authenticate student and return student data
// @access  Public (since authentication is handled on frontend)
router.post('/login', studentController.loginStudent);

// @route   GET /api/students
// @desc    Get all students (for testing purposes)
// @access  Public (since authentication is handled on frontend)
router.get('/', studentController.getAllStudents);

// @route   GET /api/students/:id
// @desc    Get student by ID or email

// @route   PUT /api/students/:id/password
// @desc    Update student password
// @access  Public (since authentication is handled on frontend)
router.put('/:id/password', studentController.updatePassword);

// @route   GET /api/students/:id
// @desc    Get student by ID or email
// @access  Public (since authentication is handled on frontend)
router.get('/:id', studentController.getStudentById);

// @route   POST /api/students
// @desc    Create a new student
// @access  Public (since authentication is handled on frontend)
router.post('/', studentController.createStudent);

// @route   PUT /api/students/:id/password
// @desc    Update student password
// @access  Public (since authentication is handled on frontend)
router.put('/:id/password', studentController.updatePassword);

// @route   PUT /api/students/:id/documents/:department
// @desc    Update student documents (store document metadata only, actual upload handled by frontend)
// @access  Public (since authentication is handled on frontend)
router.put('/:id/documents/:department', studentController.addDocumentMetadata);

// @route   DELETE /api/students/:id/documents/:department/:documentId
// @desc    Delete a document from a department
// @access  Public (since authentication is handled on frontend)
router.delete('/:id/documents/:department/:documentId', studentController.deleteDocument);

// @route   GET /api/students/:id/is-cleared
// @desc    Check if a student is fully cleared
// @access  Public (since authentication is handled on frontend)
router.get('/:id/is-cleared', studentController.isStudentCleared);

// @route   GET /api/students/verify/:id
// @desc    Verify a student's certificate by ID, roll number, or email
// @access  Public (for certificate verification)
router.get('/verify/:id', studentController.verifyCertificate);

module.exports = router;
