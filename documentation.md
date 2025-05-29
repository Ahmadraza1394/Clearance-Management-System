# Clearance Management System Documentation

## Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Frontend Documentation](#frontend-documentation)
   - [Technologies Used](#frontend-technologies)
   - [Directory Structure](#frontend-directory-structure)
   - [Key Components](#key-components)
   - [Authentication](#authentication)
   - [Context Providers](#context-providers)
   - [Pages and Routing](#pages-and-routing)
   - [File Upload System](#file-upload-system)
   - [Notification System](#notification-system)
4. [Backend Documentation](#backend-documentation)
   - [Technologies Used](#backend-technologies)
   - [API Endpoints](#api-endpoints)
   - [Database Models](#database-models)
   - [Controllers](#controllers)
   - [Middleware](#middleware)
   - [Clearance Pipeline](#clearance-pipeline)
5. [Installation and Setup](#installation-and-setup)
6. [Deployment](#deployment)

## Overview

The Clearance Management System is a comprehensive web application designed to streamline the student clearance process. It allows administrators to manage student clearance statuses across various departments, while students can track their clearance progress and upload required documents. The system also includes a notification system to keep students informed about their clearance status.

## System Architecture

The application follows a client-server architecture with:

- **Frontend**: Next.js application handling UI, client-side authentication, and document uploads
- **Backend**: Node.js/Express API for data management and business logic
- **Database**: MongoDB for data storage

The system is designed with a clear separation of concerns:
- Authentication is handled on the frontend
- Document uploads are processed directly to Cloudinary from the frontend
- The backend focuses on data management, student records, and clearance status

## Frontend Documentation

### Frontend Technologies

- **Framework**: Next.js 13+ (App Router)
- **UI Library**: React 18+
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Authentication**: Client-side JWT authentication
- **File Upload**: Cloudinary direct uploads
- **HTTP Client**: Custom API service (axios-based)
- **Icons**: React Icons (Font Awesome)

### Frontend Directory Structure

```
frontend/
├── app/
│   ├── admin/                  # Admin pages
│   │   ├── dashboard/          # Admin dashboard
│   │   ├── students/           # Student management
│   │   ├── add-student/        # Add student form
│   │   ├── upload-students/    # Bulk upload
│   │   ├── verify-certificate/ # Certificate verification
│   │   └── manage-admins/      # Admin management
│   ├── student/                # Student pages
│   │   ├── dashboard/          # Student dashboard
│   │   └── documents/          # Document upload
│   ├── components/             # Shared components
│   │   ├── Header.js           # Navigation header
│   │   ├── FileUpload/         # File upload components
│   │   └── NotificationPanel.js # Notification display
│   ├── context/                # React context providers
│   │   ├── AuthContext.js      # Authentication context
│   │   ├── StudentContext.js   # Student data context
│   │   └── NotificationContext.js # Notifications context
│   ├── utils/                  # Utility functions
│   │   ├── api.js              # API service
│   │   └── helpers.js          # Helper functions
│   ├── login/                  # Login page
│   ├── layout.js               # Root layout
│   └── page.js                 # Home page
├── public/                     # Static assets
└── next.config.js              # Next.js configuration
```

### Key Components

#### Header Component
The `Header` component provides navigation and user information display. It adapts based on the user role (admin/student) and includes the notification panel for students.

#### NotificationPanel Component
Displays notifications for students with unread indicators and allows marking notifications as read or deleted.

#### FileUpload Components
A set of components for handling document uploads to Cloudinary, including:
- `DocumentUploader`: Main upload interface
- `DocumentViewer`: Preview uploaded documents
- `FileList`: Display list of uploaded files

### Authentication

Authentication is handled entirely on the frontend using JWT tokens stored in localStorage. The `AuthContext` provides:

- User login/logout functionality
- Current user state (authenticated, role, user data)
- Token management
- Protected route handling

```javascript
// Example usage of AuthContext
const { auth, login, logout } = useAuth();

// Check if user is authenticated
if (auth.isAuthenticated) {
  // User is logged in
  console.log(auth.user);
  console.log(auth.role); // 'admin' or 'student'
}
```

### Context Providers

#### AuthContext
Manages authentication state and user information.

#### StudentContext
Provides functions for managing student data:
- Fetching students
- Adding/updating/deleting students
- Managing clearance status
- Document management

#### NotificationContext
Handles notification-related functionality:
- Fetching notifications for students
- Marking notifications as read
- Deleting notifications
- Tracking unread count

### Pages and Routing

#### Admin Routes
- `/admin/dashboard` - Overview of system status
- `/admin/students` - List and manage students
- `/admin/students/[id]` - Update student clearance status
- `/admin/add-student` - Add new student
- `/admin/upload-students` - Bulk upload students
- `/admin/verify-certificate` - Verify clearance certificates
- `/admin/manage-admins` - Manage admin accounts

#### Student Routes
- `/student/dashboard` - View clearance status and notifications
- `/student/documents` - Upload and manage documents

#### Public Routes
- `/login` - Authentication page
- `/` - Landing page

### File Upload System

Documents are uploaded directly to Cloudinary from the frontend. The system:
1. Prepares a signature for secure uploads
2. Uploads files directly to Cloudinary
3. Stores document references in the database

### Notification System

The notification system allows:
1. Automatic notifications when clearance status changes
2. Custom notifications from admins to students
3. Displaying notifications on the student dashboard
4. Marking notifications as read/unread

## Backend Documentation

### Backend Technologies

- **Framework**: Node.js with Express
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT validation (tokens generated on frontend)
- **API Documentation**: Swagger/OpenAPI

### API Endpoints

#### Authentication Endpoints
- `POST /api/auth/validate` - Validate JWT token

#### Student Endpoints
- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get student by ID
- `POST /api/students` - Create new student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student
- `GET /api/students/:id/documents` - Get student documents

#### Admin Endpoints
- `GET /api/admin/students` - Get all students (admin view)
- `PUT /api/admin/students/:id/status` - Update student clearance status
- `GET /api/admin/verify/:certificateId` - Verify certificate
- `GET /api/admin` - Get all admins
- `POST /api/admin` - Create new admin
- `PUT /api/admin/:id` - Update admin
- `DELETE /api/admin/:id` - Delete admin

#### Notification Endpoints
- `GET /api/notifications/student/:id` - Get notifications for student
- `GET /api/notifications/student/:id/unread` - Get unread count
- `POST /api/admin/notifications` - Send notification to student
- `PUT /api/notifications/:id/read` - Mark notification as read
- `DELETE /api/notifications/:id` - Delete notification

### Database Models

#### Student Model
```javascript
{
  name: String,
  email: String,
  roll_number: String,
  program: String,
  clearance_status: {
    library: Boolean,
    finance: Boolean,
    department: Boolean,
    hostel: Boolean,
    sports: Boolean
  },
  clearance_date: Date,
  documents: [{
    name: String,
    url: String,
    public_id: String,
    type: String,
    uploaded_at: Date
  }],
  created_at: Date,
  updated_at: Date
}
```

#### Admin Model
```javascript
{
  name: String,
  email: String,
  password: String, // Hashed
  created_at: Date,
  updated_at: Date
}
```

#### Notification Model
```javascript
{
  student_id: ObjectId,
  title: String,
  message: String,
  type: String, // 'clearance', 'message', 'system'
  is_read: Boolean,
  created_at: Date
}
```

### Controllers

#### studentController
Handles student-related operations including:
- CRUD operations for students
- Document management
- Clearance status verification

#### adminAuthController
Manages admin authentication and admin account operations:
- Admin login validation
- Admin CRUD operations

#### notificationController
Handles notification operations:
- Creating notifications
- Fetching notifications for students
- Marking notifications as read
- Deleting notifications

### Middleware

#### authMiddleware
Validates JWT tokens for protected routes.

### Clearance Pipeline

The clearance management system implements a structured pipeline for processing student clearances. This pipeline ensures a systematic approach to tracking and approving student clearances across different departments.

#### Pipeline Stages

1. **Initiation Stage**
   - Student account creation
   - Initial clearance status set to pending for all departments
   - Document requirements communicated to student

2. **Document Submission Stage**
   - Students upload required documents via Cloudinary
   - Document metadata stored in the database
   - Document verification queue created

3. **Departmental Verification Stage**
   - Each department reviews relevant documents and student status
   - Departments can approve or reject clearance with comments
   - Notifications sent to students on status changes

4. **Clearance Approval Stage**
   - System checks if all departmental clearances are approved
   - If all approved, student status updated to "fully cleared"
   - Clearance certificate becomes available for download
   - Automatic notification sent to student

5. **Certificate Generation Stage**
   - Clearance certificate generated with unique verification code
   - Certificate includes digital signatures and verification QR code
   - Certificate stored in database and available for download

#### Pipeline Implementation

```javascript
// Example pipeline implementation in studentController.js
const updateStudentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { clearance_status } = req.body;
    
    // Update student clearance status
    const student = await Student.findByIdAndUpdate(
      id,
      { clearance_status },
      { new: true }
    );
    
    // Check if all clearances are complete
    const allCleared = Object.values(student.clearance_status).every(status => status === true);
    
    // If all cleared, update clearance date and generate certificate
    if (allCleared) {
      student.clearance_date = new Date();
      await student.save();
      
      // Generate certificate with verification code
      const certificateId = generateUniqueId();
      
      // Create notification for student
      await Notification.create({
        student_id: student._id,
        title: 'Clearance Completed',
        message: 'Congratulations! Your clearance process is complete. You can now download your clearance certificate.',
        type: 'clearance'
      });
    } else {
      // Create notification for status update
      await Notification.create({
        student_id: student._id,
        title: 'Clearance Status Updated',
        message: 'Your clearance status has been updated. Please check your dashboard for details.',
        type: 'message'
      });
    }
    
    return res.status(200).json(student);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
```

#### Pipeline Monitoring

Administrators can monitor the clearance pipeline through the admin dashboard, which provides:

- Real-time statistics on clearance progress
- Bottleneck identification in the clearance process
- Department-wise clearance approval rates
- Average time to complete clearance by department
- Student-specific clearance tracking

The pipeline architecture ensures transparency, efficiency, and accountability in the clearance process, while providing students with timely updates on their clearance status.

#### Notification Integration

The notification system is tightly integrated with the clearance pipeline to keep students informed throughout the process:

1. **Automated Status Notifications**
   - Automatic notifications are triggered at key points in the pipeline
   - Students receive immediate updates when a department approves or rejects their clearance
   - System generates congratulatory notification when all clearances are complete

2. **Custom Administrative Notifications**
   - Administrators can send targeted messages to specific students
   - Department-specific instructions can be communicated when issues arise
   - Reminders about missing documents or pending actions are sent automatically

3. **Notification Delivery**
   - All notifications appear in real-time on the student dashboard
   - Unread notifications are highlighted with visual indicators
   - Students can mark notifications as read or delete them
   - Notification history is maintained for audit purposes

#### Pipeline Automation

The clearance pipeline includes several automated processes to reduce manual intervention:

1. **Status Aggregation**
   - Automatic calculation of overall clearance status based on departmental approvals
   - Real-time updates to clearance percentage on student dashboard
   - Automatic triggering of the certificate generation process

2. **Document Verification Workflows**
   - Automatic routing of documents to appropriate department queues
   - Document status tracking throughout the verification process
   - Automatic flagging of missing or expired documents

3. **Escalation Procedures**
   - Automatic escalation of long-pending clearance requests
   - Notification to administrators about bottlenecks in the process
   - Identification of departments with delayed response times

#### Advanced Pipeline Features

1. **Batch Processing**
   - Support for processing multiple student clearances simultaneously
   - Bulk status updates for graduating classes or specific programs
   - Mass notification capabilities for system-wide announcements

2. **Conditional Clearance Rules**
   - Department-specific rules for automatic clearance approval
   - Special handling for exceptional cases with override capabilities
   - Custom clearance requirements based on student program or status

3. **Audit Trail**
   - Comprehensive logging of all pipeline activities
   - Timestamp and user tracking for each status change
   - Complete history of document submissions and verifications
   - Record of all notifications sent through the system

## Installation and Setup

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env.local` file with the following variables:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
   ```

4. Start the development server:
   ```
   npm run dev
   ```

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/clearance-system
   JWT_SECRET=your_jwt_secret
   ```

4. Start the development server:
   ```
   npm run dev
   ```

## Deployment

### Frontend Deployment
The frontend can be deployed to Vercel, Netlify, or any other Next.js-compatible hosting service.

1. Build the application:
   ```
   npm run build
   ```

2. Deploy to Vercel:
   ```
   vercel
   ```

### Backend Deployment
The backend can be deployed to services like Heroku, Railway, or any Node.js-compatible hosting service.

1. Set up environment variables on your hosting platform
2. Deploy the application according to your hosting provider's instructions

---

This documentation provides a comprehensive overview of the Clearance Management System. For specific implementation details, refer to the code comments and inline documentation.
