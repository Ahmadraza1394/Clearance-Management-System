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

// Mock student data to avoid circular dependency
const mockStudents = [
  {
    _id: "1",
    user_id: "user1",
    name: "Ahmad Raza",
    email: "ahmad@gmail.com",
    password: "student123",
    roll_number: "BCS-F19-M-001",
  },
  {
    _id: "2",
    user_id: "user2",
    name: "Fatima Khan",
    email: "fatima@gmail.com",
    password: "student123",
    roll_number: "BCS-F19-F-002",
  },
];

// Auth Provider component
export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(initialState);

  // Function to login user
  const login = (userData) => {
    // In a real app, this would validate against the backend
    // For now we'll just update the state
    setAuth({
      isAuthenticated: true,
      user: userData,
      role: userData.role,
      loading: false,
    });

    // Store in localStorage (would use secure HttpOnly cookies in production)
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

    // For student login, check against mock student data to avoid circular dependency
    const student = mockStudents.find((s) => s.email === email);
    if (student && student.password === password) {
      const studentData = {
        id: student._id,
        user_id: student.user_id,
        username: student.name.toLowerCase().replace(" ", "."),
        email: student.email,
        role: "student",
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
