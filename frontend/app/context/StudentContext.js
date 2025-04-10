"use client";
import { createContext, useState, useContext } from "react";

// Mock data for initial development
const initialStudents = [
  {
    _id: "1",
    user_id: "user1",
    name: "Ahmad Raza",
    email: "ahmad@gmail.com",
    password: "student123",
    roll_number: "BCS-F19-M-001",
    clearance_status: {
      dispensary: true,
      hostel: true,
      due: true,
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
  const [students, setStudents] = useState(initialStudents);
  const [loading, setLoading] = useState(false);
  const [loggedInStudent, setLoggedInStudent] = useState(null); // State to track logged-in student

  // Add a single student
  const addStudent = (student) => {
    const newStudent = {
      ...student,
      _id: Date.now().toString(),
      password: "student123", // Default password
      clearance_date: null,
    };
    setStudents([...students, newStudent]);
    return newStudent;
  };

  // Add multiple students (bulk upload)
  const addBulkStudents = (newStudents) => {
    const processedStudents = newStudents.map((student) => ({
      ...student,
      _id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      password: "student123", // Default password
      clearance_date: null,
    }));
    setStudents([...students, ...processedStudents]);
    return processedStudents;
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
    setStudents(
      students.map((student) => {
        if (student._id === studentId || student.user_id === studentId) {
          return {
            ...student,
            password: newPassword,
          };
        }
        return student;
      })
    );
    return true;
  };

  // Get a student by ID
  const getStudentById = (id) => {
    return students.find(
      (student) =>
        student._id === id || student.user_id === id || student.email === id // Also match by email
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
      setLoggedInStudent(student);
      return student;
    }
    return null; // Return null if student not found
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
        loginAsStudent, // Expose the login function
        loggedInStudent, // Expose the logged-in student
      }}
    >
      {children}
    </StudentContext.Provider>
  );
};

// Custom hook to use student context
export const useStudents = () => useContext(StudentContext);
