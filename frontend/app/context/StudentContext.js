"use client";
import { createContext, useState, useContext, useEffect } from "react";

// Mock data for initial development
const initialStudents = [
  {
    _id: "1",
    user_id: "user1",
    name: "Ahmad Raza",
    email: "ahmad@gmail.com",
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
    clearance_date: new Date().toISOString(),
  },
  {
    _id: "2",
    user_id: "user2",
    name: "Fatima Khan",
    email: "fatima@gmail.com",
    password: "student123",
    roll_number: "BCS-F19-F-002",
    role: "student",
    clearance_status: {
      dispensary: true,
      hostel: true,
      due: true,
      library: false,
      academic_department: true,
      alumni: true,
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

  // Load data from localStorage on initial render
  useEffect(() => {
    const storedStudents = localStorage.getItem('students');
    if (storedStudents) {
      setStudents(JSON.parse(storedStudents));
    } else {
      // If no data in localStorage, use initialStudents
      setStudents(initialStudents);
      localStorage.setItem('students', JSON.stringify(initialStudents));
    }
    
    const storedLoggedInStudent = localStorage.getItem('loggedInStudent');
    if (storedLoggedInStudent) {
      setLoggedInStudent(JSON.parse(storedLoggedInStudent));
    }
    
    setLoading(false);
  }, []);

  // Update localStorage whenever students change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('students', JSON.stringify(students));
    }
  }, [students, loading]);

  // Update localStorage when loggedInStudent changes
  useEffect(() => {
    if (loggedInStudent) {
      localStorage.setItem('loggedInStudent', JSON.stringify(loggedInStudent));
    } else {
      localStorage.removeItem('loggedInStudent');
    }
  }, [loggedInStudent]);

  // Add a single student
  const addStudent = (student) => {
    // Check if student with same email or roll_number already exists
    const isDuplicate = students.some(
      (s) => s.email === student.email || s.roll_number === student.roll_number
    );

    if (isDuplicate) {
      return { success: false, message: "Student with this email or roll number already exists" };
    }

    const newStudent = {
      ...student,
      _id: Date.now().toString(),
      password: "student123", // Default password
      role: "student", // Default role
      clearance_date: null,
    };
    setStudents([...students, newStudent]);
    return { success: true, student: newStudent };
  };

  // Add multiple students (bulk upload)
  const addBulkStudents = (newStudents) => {
    // Filter out duplicate students based on email or roll_number
    const uniqueStudents = newStudents.filter(newStudent => {
      return !students.some(
        existingStudent => 
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
    }));

    if (processedStudents.length > 0) {
      setStudents([...students, ...processedStudents]);
    }

    return {
      success: true,
      added: processedStudents.length,
      skipped: newStudents.length - processedStudents.length,
      students: processedStudents
    };
  };

  // Update student clearance status
  const updateStudentStatus = (studentId, newStatus) => {
    setStudents(
      students.map((student) => {
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
      })
    );
  };

  // Update student password
  const updatePassword = (studentId, newPassword) => {
    // Create updated students array
    const updatedStudents = students.map((student) => {
      if (student._id === studentId || student.user_id === studentId || student.email === studentId) {
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
    localStorage.setItem('students', JSON.stringify(updatedStudents));
    
    // If this is the logged-in student, update their data in localStorage too
    if (loggedInStudent && 
        (loggedInStudent._id === studentId || 
         loggedInStudent.user_id === studentId || 
         loggedInStudent.email === studentId)) {
      const updatedLoggedInStudent = {
        ...loggedInStudent,
        password: newPassword
      };
      setLoggedInStudent(updatedLoggedInStudent);
      localStorage.setItem('loggedInStudent', JSON.stringify(updatedLoggedInStudent));
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
        role: student.role || "student" // Ensure role is set
      };
      setLoggedInStudent(studentWithRole);
      return studentWithRole;
    }
    return null; // Return null if student not found
  };

  // Get student by credentials (for auth integration)
  const getStudentByCredentials = (email, password) => {
    return students.find(student => 
      student.email === email && student.password === password
    );
  };

  return (
    <StudentContext.Provider
      value={{
        students,
        loading,
        addStudent,
        addBulkStudents,
        updateStudentStatus,
        updatePassword,
        getStudentById,
        getStudentByEmail,
        getAllStudents,
        isFullyCleared,
        loginAsStudent,
        loggedInStudent,
        getStudentByCredentials,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
};

// Custom hook to use student context
export const useStudents = () => useContext(StudentContext);
