# UET Taxila Clearance Management System - Backend

This is the backend API for the UET Taxila Clearance Management System. It provides endpoints for managing student data and clearance status while keeping authentication and document uploads on the frontend side as requested.

## Features

- Student management (create, read, update, delete)
- Clearance status tracking
- Document metadata storage
- Admin dashboard statistics
- Data migration from localStorage to MongoDB
- MVC architecture (Models, Controllers, Routes)

## Project Structure

```
backend/
├── controllers/         # Business logic
│   ├── adminController.js
│   └── studentController.js
├── models/             # Database schemas
│   └── Student.js
├── routes/             # API routes
│   ├── admin.js
│   └── students.js
├── scripts/            # Utility scripts
│   └── migrateData.js  # Data migration from localStorage
├── .env                # Environment variables
├── FRONTEND_INTEGRATION.md  # Guide for frontend integration
├── package.json        # Project dependencies
├── README.md           # This file
└── server.js           # Entry point
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account (free tier is sufficient)

## Installation

1. Install dependencies:
   ```
   npm install
   ```

2. Configure MongoDB Atlas:
   - Create a free MongoDB Atlas account at [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Set up a new cluster (the free tier is sufficient)
   - Create a database user with read/write permissions
   - Configure network access (allow access from your IP address or from anywhere for development)
   - Get your connection string from the Atlas dashboard
   - Update the `.env` file with your MongoDB Atlas connection string:
     ```
     PORT=5000
     MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/clearance-system?retryWrites=true&w=majority
     NODE_ENV=development
     ```
   - Replace `<username>`, `<password>`, and `<cluster-url>` with your actual MongoDB Atlas credentials

3. Start the server:
   ```
   npm run dev
   ```

## API Endpoints

### Student Routes

- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get student by ID, user_id, or email
- `POST /api/students` - Create a new student
- `PUT /api/students/:id/password` - Update student password
- `PUT /api/students/:id/documents/:department` - Update student documents
- `DELETE /api/students/:id/documents/:department/:documentId` - Delete a document
- `GET /api/students/:id/is-cleared` - Check if a student is fully cleared

### Admin Routes

- `GET /api/admin/dashboard` - Get dashboard statistics
- `GET /api/admin/students` - Get all students with optional filtering
- `POST /api/admin/students` - Add a new student
- `POST /api/admin/students/bulk` - Add multiple students
- `PUT /api/admin/students/:id/status` - Update student clearance status
- `DELETE /api/admin/students/:id` - Delete a student

## Data Migration

A data migration script is provided to help you transfer existing student data from localStorage to MongoDB:

1. Export your localStorage data:
   - Open your browser console on the frontend app (F12)
   - Run this command: 
     ```
     copy(JSON.stringify({students: JSON.parse(localStorage.getItem("students"))}, null, 2))
     ```
   - Paste the copied data into a file (e.g., `data.json`)

2. Run the migration script:
   ```
   node scripts/migrateData.js path/to/data.json
   ```

## Integration with Frontend

This backend is designed to work with the existing frontend while keeping authentication and document uploads on the frontend side. The backend focuses on data management, student records, and clearance status tracking.

See the detailed integration guide in `FRONTEND_INTEGRATION.md` for step-by-step instructions on how to connect your frontend with this backend.

### Key Integration Points

1. **API Service**: Create a service to handle API requests to the backend
2. **StudentContext**: Update to use backend APIs while maintaining localStorage compatibility
3. **Admin Dashboard**: Fetch statistics from the backend API
4. **Student Dashboard**: Retrieve student data from the backend
5. **Document Handling**: Continue using Cloudinary directly, but store metadata in the backend

## Testing

To test the API endpoints, you can use tools like Postman or Insomnia. Here are some example requests:

1. Get all students:
   ```
   GET http://localhost:5000/api/students
   ```

2. Get dashboard statistics:
   ```
   GET http://localhost:5000/api/admin/dashboard
   ```

3. Add a new student:
   ```
   POST http://localhost:5000/api/admin/students
   Content-Type: application/json
   
   {
     "name": "Test Student",
     "email": "test@students.uettaxila.edu.pk",
     "roll_number": "21-SE-99"
   }
   ```

## Note

This backend implementation focuses on data management while leaving authentication and document uploads to be handled on the frontend as requested. The architecture is designed to be easily extensible if you decide to move these features to the backend in the future.
