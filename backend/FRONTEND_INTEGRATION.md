# Frontend Integration Guide

This guide explains how to integrate your existing Next.js frontend with the new Express/MongoDB backend while keeping authentication and document uploads on the frontend side.

## Overview

The integration involves:
1. Updating API calls in your frontend to use the backend endpoints
2. Keeping authentication on the frontend (as requested)
3. Continuing to handle document uploads via Cloudinary on the frontend
4. Storing document metadata in the backend after successful uploads

## Step 1: Setup Environment Variables

Create or update your frontend `.env.local` file to include the backend API URL:

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Step 2: Create API Service

Create a new file `app/utils/api.js` to handle API requests:

```javascript
// app/utils/api.js
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Base API service for making HTTP requests to the backend
 */
const apiService = {
  /**
   * Make a GET request
   * @param {string} endpoint - API endpoint
   * @returns {Promise} - Response data
   */
  async get(endpoint) {
    try {
      const response = await fetch(`${API_URL}${endpoint}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
      
      return data;
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      throw error;
    }
  },
  
  /**
   * Make a POST request
   * @param {string} endpoint - API endpoint
   * @param {object} body - Request body
   * @returns {Promise} - Response data
   */
  async post(endpoint, body) {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
      
      return data;
    } catch (error) {
      console.error(`Error posting to ${endpoint}:`, error);
      throw error;
    }
  },
  
  /**
   * Make a PUT request
   * @param {string} endpoint - API endpoint
   * @param {object} body - Request body
   * @returns {Promise} - Response data
   */
  async put(endpoint, body) {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
      
      return data;
    } catch (error) {
      console.error(`Error updating ${endpoint}:`, error);
      throw error;
    }
  },
  
  /**
   * Make a DELETE request
   * @param {string} endpoint - API endpoint
   * @returns {Promise} - Response data
   */
  async delete(endpoint) {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
      
      return data;
    } catch (error) {
      console.error(`Error deleting ${endpoint}:`, error);
      throw error;
    }
  }
};

export default apiService;
```

## Step 3: Update StudentContext.js

Modify your `StudentContext.js` to use the backend API instead of localStorage. Here's how to update some of the key functions:

```javascript
// app/context/StudentContext.js
import { createContext, useState, useContext, useEffect } from "react";
import apiService from "../utils/api";

// Create the context
const StudentContext = createContext();

// Student Provider component
export const StudentProvider = ({ children }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loggedInStudent, setLoggedInStudent] = useState(null);

  // Load data from API on initial render
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await apiService.get('/students');
        setStudents(data);
        
        // Keep localStorage in sync for authentication purposes
        localStorage.setItem("students", JSON.stringify(data));
      } catch (error) {
        console.error("Error fetching students:", error);
        
        // Fallback to localStorage if API fails
        const storedStudents = localStorage.getItem("students");
        if (storedStudents) {
          setStudents(JSON.parse(storedStudents));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Add a single student
  const addStudent = async (student) => {
    try {
      // Add student via API
      const newStudent = await apiService.post('/admin/students', student);
      
      // Update local state
      setStudents([...students, newStudent]);
      
      // Keep localStorage in sync
      localStorage.setItem("students", JSON.stringify([...students, newStudent]));
      
      return { success: true, student: newStudent };
    } catch (error) {
      console.error("Error adding student:", error);
      return {
        success: false,
        message: error.message || "Failed to add student"
      };
    }
  };

  // Update student clearance status
  const updateStudentStatus = async (studentId, newStatus) => {
    try {
      // Update status via API
      const updatedStudent = await apiService.put(`/admin/students/${studentId}/status`, {
        clearance_status: newStatus
      });
      
      // Update local state
      setStudents(students.map(student => 
        student._id === updatedStudent._id ? updatedStudent : student
      ));
      
      // Keep localStorage in sync
      localStorage.setItem("students", JSON.stringify(students.map(student => 
        student._id === updatedStudent._id ? updatedStudent : student
      )));
      
      return { success: true, student: updatedStudent };
    } catch (error) {
      console.error("Error updating student status:", error);
      return {
        success: false,
        message: error.message || "Failed to update student status"
      };
    }
  };

  // Upload document (keep using Cloudinary directly from frontend)
  // After successful upload, store metadata in backend
  const uploadDocument = async (studentId, department, document) => {
    try {
      // Store document metadata in backend
      await apiService.put(`/students/${studentId}/documents/${department}`, document);
      
      // Update local state
      const updatedStudents = students.map((student) => {
        if (
          student._id === studentId ||
          student.user_id === studentId ||
          student.email === studentId
        ) {
          return {
            ...student,
            documents: {
              ...student.documents,
              [department]: [
                ...(student.documents?.[department] || []),
                document,
              ],
            },
          };
        }
        return student;
      });
      
      setStudents(updatedStudents);
      
      // Keep localStorage in sync
      localStorage.setItem("students", JSON.stringify(updatedStudents));
      
      return true;
    } catch (error) {
      console.error("Error uploading document:", error);
      return false;
    }
  };

  // Delete a document
  const deleteDocument = async (studentId, department, documentId) => {
    try {
      // Delete document metadata from backend
      await apiService.delete(`/students/${studentId}/documents/${department}/${documentId}`);
      
      // Update local state
      const updatedStudents = students.map((student) => {
        if (
          student._id === studentId ||
          student.user_id === studentId ||
          student.email === studentId
        ) {
          return {
            ...student,
            documents: {
              ...student.documents,
              [department]: (student.documents[department] || []).filter(
                (doc) => doc.id !== documentId
              ),
            },
          };
        }
        return student;
      });
      
      setStudents(updatedStudents);
      
      // Keep localStorage in sync
      localStorage.setItem("students", JSON.stringify(updatedStudents));
      
      return true;
    } catch (error) {
      console.error("Error deleting document:", error);
      return false;
    }
  };

  // Continue with other methods...

  return (
    <StudentContext.Provider
      value={{
        students,
        loading,
        loggedInStudent,
        addStudent,
        updateStudentStatus,
        uploadDocument,
        deleteDocument,
        // Include other methods...
      }}
    >
      {children}
    </StudentContext.Provider>
  );
};

// Custom hook to use student context
export const useStudents = () => useContext(StudentContext);
```

## Step 4: Update Admin Dashboard

Update the admin dashboard to fetch statistics from the backend:

```javascript
// app/admin/dashboard/page.js
useEffect(() => {
  // Check if user is authenticated and is an admin
  if (!auth.loading) {
    setLoading(false);
    if (!auth.isAuthenticated) {
      router.push("/login");
    } else if (auth.role !== "admin") {
      router.push("/");
    } else {
      // Fetch dashboard statistics from backend
      const fetchDashboardStats = async () => {
        try {
          const data = await apiService.get('/admin/dashboard');
          setStats({
            totalStudents: data.totalStudents,
            clearedStudents: data.clearedStudents,
            pendingStudents: data.pendingStudents,
            lastUpdate: new Date(data.lastUpdate).toLocaleString()
          });
        } catch (error) {
          console.error("Error fetching dashboard stats:", error);
          
          // Fallback to calculating from local data if API fails
          const students = getAllStudents();
          const clearedStudents = students.filter(student => 
            Object.values(student.clearance_status).every(status => status === true)
          ).length;
          
          setStats({
            totalStudents: students.length,
            clearedStudents: clearedStudents,
            pendingStudents: students.length - clearedStudents,
            lastUpdate: new Date().toLocaleString()
          });
        }
      };
      
      fetchDashboardStats();
    }
  }
}, [auth, router, getAllStudents]);
```

## Step 5: Update Student Dashboard

Update the student dashboard to fetch student data from the backend:

```javascript
// app/student/dashboard/page.js
useEffect(() => {
  // Check if user is authenticated and is a student
  if (!auth.loading) {
    if (!auth.isAuthenticated) {
      router.push("/login");
      return;
    } else if (auth.role !== "student") {
      router.push("/");
      return;
    }

    // Get student data using id or email, prioritizing email
    const studentId = auth.user.email || auth.user.id;
    
    const fetchStudentData = async () => {
      try {
        const studentData = await apiService.get(`/students/${studentId}`);
        setStudent(studentData);
      } catch (error) {
        console.error("Error fetching student data:", error);
        
        // Fallback to local data if API fails
        const localStudentData = auth.user.email
          ? getStudentById(auth.user.email)
          : getStudentById(auth.user.id);
          
        if (localStudentData) {
          setStudent(localStudentData);
        } else {
          console.error("Could not find student data for", studentId);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudentData();
  }
}, [auth, router, getStudentById]);
```

## Step 6: Data Migration

When you're ready to move your existing data from localStorage to the MongoDB database:

1. Export your localStorage data:
   - Open your browser console on the frontend app (F12)
   - Run this command: 
     ```
     copy(JSON.stringify({students: JSON.parse(localStorage.getItem("students"))}, null, 2))
     ```
   - Paste the copied data into a file (e.g., `data.json`)

2. Run the migration script:
   ```
   cd backend
   node scripts/migrateData.js path/to/data.json
   ```

## Important Notes

1. **Authentication**: As requested, authentication remains on the frontend side using the existing `AuthContext.js`.

2. **Document Uploads**: Continue using Cloudinary directly from the frontend, but store document metadata in the backend after successful uploads.

3. **Gradual Migration**: You can implement this integration gradually, starting with one feature at a time.

4. **Error Handling**: The code includes fallbacks to localStorage if API calls fail, ensuring a smooth transition.

5. **Data Synchronization**: The integration keeps localStorage in sync with the backend to maintain compatibility with existing code.

## Testing the Integration

1. Start the backend server:
   ```
   cd backend
   npm install
   npm run dev
   ```

2. Start the frontend development server:
   ```
   cd frontend
   npm run dev
   ```

3. Test each feature to ensure it works with the backend API.
