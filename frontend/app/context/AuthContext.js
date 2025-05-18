"use client";
import { createContext, useState, useContext, useEffect } from "react";

// Initial state for the auth context
const initialState = {
  isAuthenticated: false,
  user: null,
  role: null,
  loading: true,
};

// Create the context
const AuthContext = createContext(initialState);

// Import initialStudents from local storage to avoid circular dependency
const getInitialStudents = () => {
  if (typeof window !== 'undefined') {
    const storedStudents = localStorage.getItem('students');
    if (storedStudents) {
      return JSON.parse(storedStudents);
    }
  }
  return [];
};

// Get a student by email - always gets the latest from localStorage
const getStudentByEmail = (email) => {
  const students = getInitialStudents();
  return students.find(student => student.email === email);
};

// Auth Provider component
export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(initialState);

  // Function to login user
  const login = (userData) => {
    // Update the state
    setAuth({
      isAuthenticated: true,
      user: userData,
      role: userData.role,
      loading: false,
    });

    // Store in localStorage
    localStorage.setItem(
      "auth",
      JSON.stringify({
        isAuthenticated: true,
        user: userData,
        role: userData.role,
      })
    );
  };

  // Function to authenticate with email and password
  const loginWithEmailAndPassword = (email, password) => {
    // For admin login
    if (email === "admin@uet.edu.pk" && password === "admin123") {
      const adminData = {
        id: "admin1",
        username: "admin",
        email: "admin@uet.edu.pk",
        role: "admin",
        name: "Tahir Ahmad",
      };
      login(adminData);
      return { success: true, user: adminData };
    }

    // For student login, always get the latest data from localStorage
    const student = getStudentByEmail(email);
    if (student && student.password === password) {
      const studentData = {
        id: student._id,
        user_id: student.user_id,
        username: student.name.toLowerCase().replace(" ", "."),
        email: student.email,
        role: student.role || "student", // Use role from student data if available
        name: student.name,
        roll_number: student.roll_number,
      };
      login(studentData);
      return { success: true, user: studentData };
    }

    return { success: false, message: "Invalid email or password" };
  };

  // Function to logout user
  const logout = () => {
    setAuth({
      isAuthenticated: false,
      user: null,
      role: null,
      loading: false,
    });
    localStorage.removeItem("auth");
  };

  // Check if user is already logged in (on mount)
  useEffect(() => {
    const checkUserLoggedIn = () => {
      const storedAuth = localStorage.getItem("auth");
      if (storedAuth) {
        try {
          const parsedAuth = JSON.parse(storedAuth);
          setAuth({
            ...parsedAuth,
            loading: false,
          });
        } catch (error) {
          setAuth({ ...initialState, loading: false });
        }
      } else {
        setAuth({ ...initialState, loading: false });
      }
    };

    checkUserLoggedIn();
  }, []);

  return (
    <AuthContext.Provider
      value={{ auth, login, loginWithEmailAndPassword, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);
