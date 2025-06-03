const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://clearance-management-system-frontend.vercel.app',
    'https://clearance-management-system-frontend-bo6ddxkug.vercel.app',
    'https://clearance-management-system-frontend-p20d4r00f.vercel.app',
    'https://clearance-management-system-fronten.vercel.app',
    'https://clearance-management-system-frontend-*.vercel.app',
    // Allow all subdomains of vercel.app that start with clearance-management-system-frontend
    /^https:\/\/clearance-management-system-frontend-.*\.vercel\.app$/
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/students', require('./routes/students'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/admins', require('./routes/admins'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/chatbot', require('./routes/chatbotRoutes'));

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to UET Taxila Clearance Management System API' });
});

// Connect to MongoDB Atlas
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000 // Timeout after 5s instead of 30s
    });
    console.log('MongoDB Atlas Connected...');
  } catch (err) {
    console.error('MongoDB Atlas Connection Error:', err.message);
    console.log('Please make sure you have updated the .env file with your MongoDB Atlas connection string');
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
