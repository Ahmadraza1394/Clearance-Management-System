"use client";
import { createContext, useState, useContext, useEffect } from "react";
import apiService from "../utils/api";

// Mock data for initial development
const initialStudents = [
  {
    _id: "1",
    user_id: "41X4Y3",
    name: "Ahmad Raza",
    email: "21-se-32@students.uettaxila.edu.pk",
    password: "student123",
    roll_number: "21-SE-32",
    role: "student",
    clearance_status: {
      dispensary: true,
      hostel: true,
      due: false,
      library: true,
      academic_department: true,
      alumni: true,
    },
    documents: {
      dispensary: [],
      hostel: [],
      due: [],
      library: [],
      academic_department: [],
      alumni: [],
    },
    clearance_date: new Date().toISOString(),
  },
  {
    _id: "2",
    user_id: "4BX4N4",
    name: "21-SE-10",
    email: "21-se-10@students.uettaxila.edu.pk",
    password: "student123",
    roll_number: "21-SE-10",
    role: "student",
    clearance_status: {
      dispensary: true,
      hostel: true,
      due: true,
      library: false,
      academic_department: true,
      alumni: true,
    },
    documents: {
      dispensary: [],
      hostel: [],
      due: [],
      library: [],
      academic_department: [],
      alumni: [],
    },
    clearance_date: new Date().toISOString(),
  },
];

// Create the context
const StudentContext = createContext();

// Student Provider component
export const StudentProvider = ({ children }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loggedInStudent, setLoggedInStudent] = useState(null);

  // Load data from backend API on initial render, with localStorage fallback
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        // Try to fetch students from the backend API
        const data = await apiService.get('/students');
        setStudents(data);
        
        // Keep localStorage in sync with backend data
        localStorage.setItem("students", JSON.stringify(data));
        
        console.log('Loaded students from backend API');
      } catch (error) {
        console.error("Error fetching students from API:", error);
        
        // Fallback to localStorage if API fails
        const storedStudents = localStorage.getItem("students");
        if (storedStudents) {
          setStudents(JSON.parse(storedStudents));
          console.log('Loaded students from localStorage (fallback)');
        } else {
          // If no data in localStorage, use initialStudents
          setStudents(initialStudents);
          localStorage.setItem("students", JSON.stringify(initialStudents));
          console.log('Loaded initial mock students');
        }
      }

      const storedLoggedInStudent = localStorage.getItem("loggedInStudent");
      if (storedLoggedInStudent) {
        setLoggedInStudent(JSON.parse(storedLoggedInStudent));
      }

      setLoading(false);
    };

    fetchStudents();
  }, []);

  // Update localStorage whenever students change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem("students", JSON.stringify(students));
    }
  }, [students, loading]);

  // Update localStorage when loggedInStudent changes
  useEffect(() => {
    if (loggedInStudent) {
      localStorage.setItem("loggedInStudent", JSON.stringify(loggedInStudent));
    } else {
      localStorage.removeItem("loggedInStudent");
    }
  }, [loggedInStudent]);

  // Add a new student (admin only)
  const addStudent = async (student) => {
    try {
      // Check for duplicate email or roll number in local state first
      const isDuplicate = students.some(
        (s) =>
          s.email === student.email || s.roll_number === student.roll_number
      );

      if (isDuplicate) {
        return {
          success: false,
          message: "Student with this email or roll number already exists",
        };
      }

      try {
        // Make sure we're sending the clearance_status properly
        const studentData = {
          ...student,
          password: "student123", // Default password
        };
        
        console.log('Sending student data to API:', studentData);
        
        // Try to add student via API
        const newStudent = await apiService.post('/admin/students', studentData);
        
        console.log('Student added via backend API:', newStudent);
        
        // Update local state
        setStudents([...students, newStudent]);
        
        // Keep localStorage in sync
        localStorage.setItem("students", JSON.stringify([...students, newStudent]));
        
        return { success: true, student: newStudent };
      } catch (apiError) {
        console.error("Error adding student via API:", apiError);
        
        // Show more detailed error message
        if (apiError.message) {
          return { success: false, message: `API Error: ${apiError.message}` };
        }
        
        // If we can't communicate with the API, fall back to local storage
        const newStudent = {
          ...student,
          _id: Date.now().toString(),
          password: "student123", // Default password
          role: "student", // Default role
          clearance_date: null,
          documents: {
            dispensary: [],
            hostel: [],
            due: [],
            library: [],
            academic_department: [],
            alumni: [],
          },
        };
        
        setStudents([...students, newStudent]);
        localStorage.setItem("students", JSON.stringify([...students, newStudent]));
        
        return { success: true, student: newStudent };
      }
    } catch (error) {
      console.error("Error adding student:", error);
      return { success: false, message: "An error occurred while adding the student" };
    }
  };

  // Delete a student
  const deleteStudent = async (studentId) => {
    try {
      // Try to delete student via API
      await apiService.delete(`/admin/students/${studentId}`);
      console.log('Student deleted via backend API');
      
      // Update local state
      const updatedStudents = students.filter(student => student._id !== studentId);
      setStudents(updatedStudents);
      
      // Keep localStorage in sync
      localStorage.setItem("students", JSON.stringify(updatedStudents));
      
      return { success: true, message: 'Student deleted successfully' };
    } catch (error) {
      console.error("Error deleting student via API:", error);
      
      // Show more detailed error message
      if (error.message) {
        return { success: false, message: `API Error: ${error.message}` };
      }
      
      // If we can't communicate with the API, fall back to local storage
      const updatedStudents = students.filter(student => student._id !== studentId);
      setStudents(updatedStudents);
      localStorage.setItem("students", JSON.stringify(updatedStudents));
      
      return { success: true, message: 'Student deleted from local storage (fallback)' };
    }
  };

  // Add multiple students (bulk upload)
  const addBulkStudents = async (newStudents) => {
    try {
      // Try to add students via API first
      try {
        console.log('Attempting to add students via backend API');
        const result = await apiService.post('/admin/students/bulk', { students: newStudents });
        
        console.log('Bulk upload result from API:', result);
        
        // Update local state with the returned students
        if (result.students && result.students.length > 0) {
          setStudents([...students, ...result.students]);
          
          // Keep localStorage in sync
          localStorage.setItem("students", JSON.stringify([...students, ...result.students]));
        }
        
        return {
          success: true,
          added: result.added,
          skipped: result.skipped,
          students: result.students
        };
      } catch (apiError) {
        console.error("Error adding students via API:", apiError);
        
        // Fall back to local storage if API fails
        console.log('Falling back to local storage for bulk upload');
        
        // Filter out duplicate students based on email or roll_number
        const uniqueStudents = newStudents.filter((newStudent) => {
          return !students.some(
            (existingStudent) =>
              existingStudent.email === newStudent.email ||
              existingStudent.roll_number === newStudent.roll_number
          );
        });
    
        // Process only unique students
        const processedStudents = uniqueStudents.map((student) => ({
          ...student,
          _id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          password: "student123", // Default password
          role: "student", // Default role
          clearance_date: null,
          documents: {
            dispensary: [],
            hostel: [],
            due: [],
            library: [],
            academic_department: [],
            alumni: [],
          },
        }));
    
        if (processedStudents.length > 0) {
          setStudents([...students, ...processedStudents]);
          localStorage.setItem("students", JSON.stringify([...students, ...processedStudents]));
        }
    
        return {
          success: true,
          added: processedStudents.length,
          skipped: newStudents.length - processedStudents.length,
          students: processedStudents,
        };
      }
    } catch (error) {
      console.error("Error in bulk upload:", error);
      return {
        success: false,
        message: "An error occurred during bulk upload",
        error: error.message
      };
    }
  };

  // This function was removed to avoid duplication with the existing isFullyCleared function defined below

  // Update student clearance status
  const updateStudentStatus = async (studentId, newStatus) => {
    try {
      // Try to update status via API
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
      console.error("Error updating student status via API:", error);
      
      // Fallback to local operation if API fails
      const updatedStudents = students.map((student) => {
        if (student._id === studentId) {
          // Check if all statuses are true after update
          const allCleared = Object.values({
            ...student.clearance_status,
            ...newStatus,
          }).every((status) => status === true);

          return {
            ...student,
            clearance_status: { ...student.clearance_status, ...newStatus },
            clearance_date: allCleared
              ? new Date().toISOString()
              : student.clearance_date,
          };
        }
        return student;
      });
      
      setStudents(updatedStudents);
      localStorage.setItem("students", JSON.stringify(updatedStudents));
      
      const updatedStudent = updatedStudents.find(s => s._id === studentId);
      return { success: true, student: updatedStudent };
    }
  };

  // Update student password
  const updatePassword = (studentId, newPassword) => {
    // Create updated students array
    const updatedStudents = students.map((student) => {
      if (
        student._id === studentId ||
        student.user_id === studentId ||
        student.email === studentId
      ) {
        return {
          ...student,
          password: newPassword,
        };
      }
      return student;
    });

    // Update state
    setStudents(updatedStudents);

    // Immediately update localStorage to ensure changes are available for login
    localStorage.setItem("students", JSON.stringify(updatedStudents));

    // If this is the logged-in student, update their data in localStorage too
    if (
      loggedInStudent &&
      (loggedInStudent._id === studentId ||
        loggedInStudent.user_id === studentId ||
        loggedInStudent.email === studentId)
    ) {
      const updatedLoggedInStudent = {
        ...loggedInStudent,
        password: newPassword,
      };
      setLoggedInStudent(updatedLoggedInStudent);
      localStorage.setItem(
        "loggedInStudent",
        JSON.stringify(updatedLoggedInStudent)
      );
    }

    return true;
  };

  // Get a student by ID
  const getStudentById = (id) => {
    return students.find(
      (student) =>
        student._id === id || student.user_id === id || student.email === id
    );
  };

  // Get a student by email
  const getStudentByEmail = (email) => {
    return students.find((student) => student.email === email);
  };

  // Get all students
  const getAllStudents = () => {
    return students;
  };

  // Verify if student is fully cleared
  const isFullyCleared = (studentId) => {
    const student = getStudentById(studentId);
    if (!student) return false;

    return Object.values(student.clearance_status).every(
      (status) => status === true
    );
  };

  // Login as a specific student
  const loginAsStudent = (userId) => {
    const student = getStudentById(userId);
    if (student) {
      const studentWithRole = {
        ...student,
        role: student.role || "student", // Ensure role is set
      };
      setLoggedInStudent(studentWithRole);
      return studentWithRole;
    }
    return null; // Return null if student not found
  };

  // Get student by credentials (for auth integration)
  const getStudentByCredentials = (email, password) => {
    return students.find(
      (student) => student.email === email && student.password === password
    );
  };

  // Upload document for a specific department
  // Note: Actual file upload is still handled by Cloudinary on frontend
  // This function only stores document metadata
  const uploadDocument = async (studentId, department, document) => {
    try {
      // Create a document object with metadata
      const newDocument = {
        id: Date.now().toString(),
        url: document.url,
        publicId: document.publicId,
        filename: document.filename,
        fileType: document.fileType,
        uploadDate: new Date().toISOString(),
      };
      
      // Store document metadata in backend
      await apiService.put(`/students/${studentId}/documents/${department}`, newDocument);
      
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
                newDocument,
              ],
            },
          };
        }
        return student;
      });
      
      setStudents(updatedStudents);
      
      // Keep localStorage in sync
      localStorage.setItem("students", JSON.stringify(updatedStudents));
      
      // Update logged in student if applicable
      if (
        loggedInStudent &&
        (loggedInStudent._id === studentId ||
          loggedInStudent.user_id === studentId ||
          loggedInStudent.email === studentId)
      ) {
        const updatedStudent = updatedStudents.find(
          (s) =>
            s._id === studentId ||
            s.user_id === studentId ||
            s.email === studentId
        );
        if (updatedStudent) {
          setLoggedInStudent(updatedStudent);
          localStorage.setItem("loggedInStudent", JSON.stringify(updatedStudent));
        }
      }
      
      return true;
    } catch (error) {
      console.error("Error storing document metadata via API:", error);
      
      // Fallback to local operation if API fails
      const updatedStudents = students.map((student) => {
        if (
          student._id === studentId ||
          student.user_id === studentId ||
          student.email === studentId
        ) {
          // Create a new document object with metadata
          const newDocument = {
            id: Date.now().toString(),
            url: document.url,
            publicId: document.publicId,
            filename: document.filename,
            fileType: document.fileType,
            uploadDate: new Date().toISOString(),
          };

          return {
            ...student,
            documents: {
              ...student.documents,
              [department]: [
                ...(student.documents?.[department] || []),
                newDocument,
              ],
            },
          };
        }
        return student;
      });

      setStudents(updatedStudents);
      localStorage.setItem("students", JSON.stringify(updatedStudents));

      // Update logged in student if applicable
      if (
        loggedInStudent &&
        (loggedInStudent._id === studentId ||
          loggedInStudent.user_id === studentId ||
          loggedInStudent.email === studentId)
      ) {
        const updatedStudent = updatedStudents.find(
          (s) =>
            s._id === studentId ||
            s.user_id === studentId ||
            s.email === studentId
        );
        if (updatedStudent) {
          setLoggedInStudent(updatedStudent);
          localStorage.setItem("loggedInStudent", JSON.stringify(updatedStudent));
        }
      }

      return true;
    }
  };

  // Get documents for a specific student and department
  const getStudentDocuments = (studentId, department = null) => {
    const student = getStudentById(studentId);
    if (!student || !student.documents) return department ? [] : {};

    if (department) {
      return student.documents[department] || [];
    }

    return student.documents;
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
          // Create a new student object with the document removed
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

      // Update the state
      setStudents(updatedStudents);

      // Important: Immediately update localStorage to persist the change
      localStorage.setItem("students", JSON.stringify(updatedStudents));

      // Update logged in student if applicable
      if (
        loggedInStudent &&
        (loggedInStudent._id === studentId ||
          loggedInStudent.user_id === studentId ||
          loggedInStudent.email === studentId)
      ) {
        const updatedStudent = updatedStudents.find(
          (s) =>
            s._id === studentId ||
            s.user_id === studentId ||
            s.email === studentId
        );
        if (updatedStudent) {
          setLoggedInStudent(updatedStudent);
          localStorage.setItem(
            "loggedInStudent",
            JSON.stringify(updatedStudent)
          );
        }
      }

      return true;
    } catch (error) {
      console.error("Error in deleteDocument:", error);
      return false;
    }
  };

  return (
    <StudentContext.Provider
      value={{
        students,
        setStudents,
        getAllStudents,
        getStudentById,
        addStudent,
        addBulkStudents,
        updateStudentStatus,
        updatePassword,
        loggedInStudent,
        setLoggedInStudent,
        deleteStudent,
        getStudentByCredentials,
        uploadDocument,
        getStudentDocuments,
        deleteDocument,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
};

// Custom hook to use student context
export const useStudents = () => useContext(StudentContext);
