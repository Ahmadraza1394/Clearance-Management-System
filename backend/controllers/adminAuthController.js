const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');

// Get all admins
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select('-password -password_is_hashed -original_password');
    res.json(admins);
  } catch (err) {
    console.error('Error fetching admins:', err.message);
    res.status(500).send('Server Error');
  }
};

// Get admin by ID
exports.getAdminById = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id).select('-password -password_is_hashed -original_password');
    
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    
    res.json(admin);
  } catch (err) {
    console.error('Error fetching admin:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.status(500).send('Server Error');
  }
};

// Create a new admin
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email and password' });
    }
    
    // Check if admin already exists
    let admin = await Admin.findOne({ email });
    
    if (admin) {
      return res.status(400).json({ message: 'Admin with this email already exists' });
    }
    
    // Create new admin
    admin = new Admin({
      name,
      email,
      password,
      password_is_hashed: false,
      original_password: password
    });
    
    await admin.save();
    
    // Return admin without sensitive fields
    const adminResponse = admin.toObject();
    delete adminResponse.password;
    delete adminResponse.password_is_hashed;
    delete adminResponse.original_password;
    
    res.json(adminResponse);
  } catch (err) {
    console.error('Error creating admin:', err.message);
    res.status(500).send('Server Error');
  }
};

// Update admin
exports.updateAdmin = async (req, res) => {
  try {
    const { name, email } = req.body;
    
    // Find admin
    let admin = await Admin.findById(req.params.id);
    
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    
    // Update fields
    if (name) admin.name = name;
    if (email) admin.email = email;
    
    await admin.save();
    
    // Return admin without sensitive fields
    const adminResponse = admin.toObject();
    delete adminResponse.password;
    delete adminResponse.password_is_hashed;
    delete adminResponse.original_password;
    
    res.json(adminResponse);
  } catch (err) {
    console.error('Error updating admin:', err.message);
    res.status(500).send('Server Error');
  }
};

// Update admin password
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Find admin
    let admin = await Admin.findById(req.params.id);
    
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    
    // Check current password
    if (admin.password !== currentPassword) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    // Update password
    admin.password = newPassword;
    admin.original_password = newPassword;
    
    await admin.save();
    
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Error updating admin password:', err.message);
    res.status(500).send('Server Error');
  }
};

// Delete admin
exports.deleteAdmin = async (req, res) => {
  try {
    // Find and delete admin
    const admin = await Admin.findByIdAndDelete(req.params.id);
    
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    
    res.json({ message: 'Admin deleted successfully' });
  } catch (err) {
    console.error('Error deleting admin:', err.message);
    res.status(500).send('Server Error');
  }
};

// Admin login
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find admin by email
    const admin = await Admin.findOne({ email });
    
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    
    // Check password
    if (admin.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Update last login
    admin.last_login = new Date();
    await admin.save();
    
    // Return admin without password
    const adminData = admin.toObject();
    delete adminData.password;
    delete adminData.password_is_hashed;
    delete adminData.original_password;
    
    res.json({ success: true, admin: adminData });
  } catch (err) {
    console.error('Error during admin login:', err.message);
    res.status(500).send('Server Error');
  }
};
