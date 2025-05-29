const express = require('express');
const router = express.Router();
const adminAuthController = require('../controllers/adminAuthController');

// @route   GET /api/admins
// @desc    Get all admins
// @access  Public (since authentication is handled on frontend)
router.get('/', adminAuthController.getAllAdmins);

// @route   GET /api/admins/:id
// @desc    Get admin by ID
// @access  Public (since authentication is handled on frontend)
router.get('/:id', adminAuthController.getAdminById);

// @route   POST /api/admins
// @desc    Create a new admin
// @access  Public (since authentication is handled on frontend)
router.post('/', adminAuthController.createAdmin);

// @route   PUT /api/admins/:id
// @desc    Update admin
// @access  Public (since authentication is handled on frontend)
router.put('/:id', adminAuthController.updateAdmin);

// @route   PUT /api/admins/:id/password
// @desc    Update admin password
// @access  Public (since authentication is handled on frontend)
router.put('/:id/password', adminAuthController.updatePassword);

// @route   DELETE /api/admins/:id
// @desc    Delete admin
// @access  Public (since authentication is handled on frontend)
router.delete('/:id', adminAuthController.deleteAdmin);

// @route   POST /api/admins/login
// @desc    Admin login
// @access  Public (since authentication is handled on frontend)
router.post('/login', adminAuthController.loginAdmin);

module.exports = router;
