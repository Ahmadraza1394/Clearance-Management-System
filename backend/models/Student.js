const mongoose = require('mongoose');

// Document schema (embedded in Student)
const DocumentSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  publicId: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  }
});

// Student schema
const StudentSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    unique: true
  },
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
  original_password: {
    type: String
  },
  password_is_hashed: {
    type: Boolean,
    default: false
  },
  roll_number: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: String,
    default: 'student'
  },
  clearance_status: {
    dispensary: {
      type: Boolean,
      default: false
    },
    hostel: {
      type: Boolean,
      default: false
    },
    due: {
      type: Boolean,
      default: false
    },
    library: {
      type: Boolean,
      default: false
    },
    academic_department: {
      type: Boolean,
      default: false
    },
    alumni: {
      type: Boolean,
      default: false
    }
  },
  documents: {
    dispensary: [DocumentSchema],
    hostel: [DocumentSchema],
    due: [DocumentSchema],
    library: [DocumentSchema],
    academic_department: [DocumentSchema],
    alumni: [DocumentSchema]
  },
  clearance_date: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Student', StudentSchema);
