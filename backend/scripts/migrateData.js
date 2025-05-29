/**
 * Data Migration Script
 * 
 * This script helps migrate student data from frontend localStorage to the MongoDB database.
 * 
 * Usage:
 * 1. Export your localStorage data to a JSON file (instructions below)
 * 2. Run this script with the path to your JSON file:
 *    node migrateData.js path/to/data.json
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Import Student model
const Student = require('../models/Student');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/clearance-system')
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err.message);
    process.exit(1);
  });

/**
 * Migrate data from JSON file to MongoDB
 * @param {string} filePath - Path to the JSON file containing localStorage data
 */
async function migrateData(filePath) {
  try {
    // Read and parse the JSON file
    const rawData = fs.readFileSync(filePath);
    const data = JSON.parse(rawData);
    
    // Check if the data contains students
    if (!data.students || !Array.isArray(data.students)) {
      console.error('Invalid data format. Expected an array of students.');
      process.exit(1);
    }
    
    console.log(`Found ${data.students.length} students to migrate.`);
    
    // Statistics
    const stats = {
      added: 0,
      skipped: 0,
      errors: 0
    };
    
    // Process each student
    for (const studentData of data.students) {
      try {
        // Check if student already exists
        const existingStudent = await Student.findOne({
          $or: [
            { email: studentData.email },
            { roll_number: studentData.roll_number }
          ]
        });
        
        if (existingStudent) {
          console.log(`Student with email ${studentData.email} already exists. Skipping...`);
          stats.skipped++;
          continue;
        }
        
        // Create new student document
        const student = new Student({
          user_id: studentData.user_id || studentData._id,
          name: studentData.name,
          email: studentData.email,
          password: studentData.password || 'student123',
          roll_number: studentData.roll_number,
          role: studentData.role || 'student',
          clearance_status: studentData.clearance_status || {
            dispensary: false,
            hostel: false,
            due: false,
            library: false,
            academic_department: false,
            alumni: false
          },
          documents: studentData.documents || {
            dispensary: [],
            hostel: [],
            due: [],
            library: [],
            academic_department: [],
            alumni: []
          },
          clearance_date: studentData.clearance_date || null
        });
        
        // Save student to database
        await student.save();
        console.log(`Migrated student: ${student.name} (${student.email})`);
        stats.added++;
      } catch (err) {
        console.error(`Error migrating student ${studentData.email}:`, err.message);
        stats.errors++;
      }
    }
    
    // Print summary
    console.log('\nMigration Summary:');
    console.log(`- Total students found: ${data.students.length}`);
    console.log(`- Successfully migrated: ${stats.added}`);
    console.log(`- Skipped (already exist): ${stats.skipped}`);
    console.log(`- Errors: ${stats.errors}`);
    
    console.log('\nMigration completed!');
  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    // Close MongoDB connection
    mongoose.disconnect();
  }
}

// Get file path from command line arguments
const filePath = process.argv[2];

if (!filePath) {
  console.error('Please provide a path to the JSON file containing localStorage data.');
  console.log('\nUsage: node migrateData.js path/to/data.json');
  console.log('\nHow to export localStorage data:');
  console.log('1. Open your browser console on the frontend app (F12)');
  console.log('2. Run this command: copy(JSON.stringify({students: JSON.parse(localStorage.getItem("students"))}, null, 2))');
  console.log('3. Paste the copied data into a file (data.json)');
  console.log('4. Run this script with the path to your JSON file');
  process.exit(1);
}

// Run migration
migrateData(filePath);
