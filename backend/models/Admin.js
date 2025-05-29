const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  password_is_hashed: {
    type: Boolean,
    default: false
  },
  original_password: {
    type: String
  },
  role: {
    type: String,
    default: 'admin'
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  last_login: {
    type: Date
  }
});

module.exports = mongoose.model('Admin', AdminSchema);
