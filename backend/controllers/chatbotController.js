const OpenAI = require('openai');
const Student = require('../models/Student');

// Initialize OpenAI client
let openai;
try {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
} catch (error) {
  console.error('Error initializing OpenAI client:', error);
}

/**
 * Process a student's query and generate a response based on their clearance status
 */
exports.processQuery = async (req, res) => {
  try {
    const { studentId, query } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Query is required'
      });
    }

    // Check if OpenAI client is initialized
    if (!openai) {
      return res.status(500).json({
        success: false,
        message: 'Chatbot service is currently unavailable. Please try again later.'
      });
    }

    // Check if this is a guest user or no studentId provided
    if (!studentId || studentId === 'guest') {
      // Provide general information for guest users
      return await handleGuestQuery(query, res);
    }

    // Get student data for authenticated users
    const student = await Student.findById(studentId);
    if (!student) {
      // If student not found, fall back to guest mode
      return await handleGuestQuery(query, res);
    }

    // Prepare context about the student's clearance status
    const clearanceStatus = student.clearance_status || {};
    const pendingDepartments = [];
    const clearedDepartments = [];

    for (const [department, isCleared] of Object.entries(clearanceStatus)) {
      if (isCleared) {
        clearedDepartments.push(department.replace(/_/g, ' '));
      } else {
        pendingDepartments.push(department.replace(/_/g, ' '));
      }
    }

    const isFullyCleared = pendingDepartments.length === 0;
    
    // Prepare system message with student context
    const systemMessage = `You are a helpful assistant for the university clearance management system. 
    Your role is to guide students through their clearance process.
    
    Student Information:
    - Name: ${student.name}
    - Roll Number: ${student.roll_number}
    - Email: ${student.email}
    - Clearance Status: ${isFullyCleared ? 'Fully cleared' : 'Pending clearance'}
    
    Cleared Departments: ${clearedDepartments.length > 0 ? clearedDepartments.join(', ') : 'None'}
    Pending Departments: ${pendingDepartments.length > 0 ? pendingDepartments.join(', ') : 'None'}
    
    General Clearance Process:
    1. Students must visit each department and get clearance
    2. For dispensary clearance: Visit the university health center with your ID and get Clearance document from dispensary staff and upload it in the system
    3. For hostel clearance: Get a hostel clearance from the hostel warden and upload it in the system
    4. For dues clearance: Visit the accounts office and clear any outstanding fees and get Clearance document from accounts staff and upload it in the system
    5. For library clearance: Return all borrowed books and pay any fines and get Clearance document from library staff and upload it in the system
    6. For academic department clearance: Visit your department office with your ID and get Clearance document from department staff and upload it in the system
    7. For alumni clearance: Register with the alumni office and get Clearance document from alumni staff and upload it in the system
    
    When a student is fully cleared, they can download their clearance certificate from the dashboard, after getting clearance certificate go to your department and get your transcript.
    Your uploaded documents will be verify from our admin staff when all things are verified than your clarance status would be updated to cleared and you can download certificat as proof.
    Do greetings with the student name and be friendly.
    when user ask about any other topic than clearance than you should say that you are here to help related clearance system .
    
    Provide specific guidance based on the student's current clearance status. Be friendly, concise, and helpful.give small and simple answer`;

    // Generate response from OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: query }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    // Send response back to client
    return res.status(200).json({
      success: true,
      response: response.choices[0].message.content
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while processing your query'
    });
  }
};

/**
 * Handle queries from guest users or when student data is not available
 * @param {string} query - The user's query
 * @param {Object} res - Express response object
 */
async function handleGuestQuery(query, res) {
  try {
    // Prepare general system message for guests
    const systemMessage = `You are a helpful assistant for the university clearance management system. 
    Your role is to guide students through their clearance process.
    
    General Clearance Process:
    1. Students must visit each department and get clearance
    2. For dispensary clearance: Visit the university health center with your ID and get Clearance document from dispensary staff and upload it in the system
    3. For hostel clearance: Get a hostel clearance from the hostel warden and upload it in the system
    4. For dues clearance: Visit the accounts office and clear any outstanding fees and get Clearance document from accounts staff and upload it in the system
    5. For library clearance: Return all borrowed books and pay any fines and get Clearance document from library staff and upload it in the system
    6. For academic department clearance: Visit your department office with your ID and get Clearance document from department staff and upload it in the system
    7. For alumni clearance: Register with the alumni office and get Clearance document from alumni staff and upload it in the system
    
    When a student is fully cleared, they can download their clearance certificate from the dashboard.
    
    Provide general guidance about the clearance process. Be friendly, concise, and helpful.
    If asked about specific student details, explain that you can only provide general information unless logged in.`;

    // Generate response from OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: query }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    // Send response back to client
    return res.status(200).json({
      success: true,
      response: response.choices[0].message.content
    });

  } catch (error) {
    console.error('Chatbot guest query error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while processing your query'
    });
  }
}
