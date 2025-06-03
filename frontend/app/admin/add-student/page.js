"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useStudents } from "../../context/StudentContext";
import Link from "next/link";
import Header from "@/app/components/Header";
import CenterNotification from "@/app/components/CenterNotification";
import Loader from "@/app/components/Loader";

export default function AddStudent() {
  const router = useRouter();
  const { auth, logout } = useAuth();
  const { addStudent } = useStudents();
  const [loading, setLoading] = useState(true);
  
  // Center notification state
  const [notification, setNotification] = useState({
    show: false,
    type: 'success',
    message: ''
  });

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    roll_number: "",
    email: "",
    clearance_status: {
      dispensary: false,
      hostel: false,
      due: false,
      library: false,
      academic_department: false,
      alumni: false,
    },
  });

  // Validation errors
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Check if user is authenticated and is an admin
    if (!auth.loading) {
      if (!auth.isAuthenticated) {
        router.push("/login");
      } else if (auth.role !== "admin") {
        router.push("/");
      } else {
        setLoading(false);
      }
    }
  }, [auth, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when changed
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleStatusChange = (department, checked) => {
    setFormData((prev) => ({
      ...prev,
      clearance_status: {
        ...prev.clearance_status,
        [department]: checked,
      },
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.roll_number.trim()) {
      newErrors.roll_number = "Roll number is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        // Add the student
        const result = await addStudent(formData);
        
        if (result.success) {
          // Show success notification
          setNotification({
            show: true,
            type: 'success',
            message: 'Student added successfully!'
          });

          // Reset form
          setFormData({
            name: "",
            roll_number: "",
            email: "",
            clearance_status: {
              dispensary: false,
              hostel: false,
              due: false,
              library: false,
              academic_department: false,
              alumni: false,
            },
          });

          // Redirect to students page after a short delay to show success message
          setTimeout(() => {
            router.push("/admin/students");
          }, 2000);
        } else {
          // Display error notification
          setNotification({
            show: true,
            type: 'error',
            message: result.message || 'Failed to add student. Please try again.'
          });
        }
      } catch (error) {
        // Display error notification for exceptions
        setNotification({
          show: true,
          type: 'error',
          message: 'An error occurred while adding the student. Please try again.'
        });
      }
    }
  };

  if (loading) {
    return <Loader message="Loading Add Student form..." />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Header */}
      <Header title={"Add New Student"} auth={auth} logout={logout} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-8 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900">Add New Student</h1>
            <p className="mt-2 text-sm text-gray-600">Enter the details of the new student to add them to the system.</p>
          </div>

          <CenterNotification
            show={notification.show}
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(prev => ({ ...prev, show: false }))}
            duration={2000}
          />

          <form onSubmit={handleSubmit} className="px-6 py-8 space-y-8">
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Student Information</h2>
                <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full name</label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.name ? "border-red-300" : ""}`}
                    />
                    {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="roll_number" className="block text-sm font-medium text-gray-700">Roll number</label>
                    <input
                      type="text"
                      name="roll_number"
                      id="roll_number"
                      value={formData.roll_number}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.roll_number ? "border-red-300" : ""}`}
                    />
                    {errors.roll_number && <p className="mt-2 text-sm text-red-600">{errors.roll_number}</p>}
                  </div>

                  <div className="sm:col-span-6">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${errors.email ? "border-red-300" : ""}`}
                      placeholder="student@example.com"
                    />
                    {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900">Initial Clearance Status</h2>
                <p className="mt-1 text-sm text-gray-600">Set the initial clearance status for each department.</p>
                <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(formData.clearance_status).map(([department, status]) => (
                    <div key={department} className="relative flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id={department}
                          name={department}
                          type="checkbox"
                          checked={status}
                          onChange={(e) => handleStatusChange(department, e.target.checked)}
                          className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor={department} className="font-medium text-gray-700 capitalize">
                          {department.replace(/_/g, " ")}
                        </label>
                        <p className={`text-sm ${status ? "text-green-600" : "text-gray-500"}`}>
                          {status ? "Cleared" : "Not cleared"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4">
              <Link
                href="/admin/dashboard"
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Add Student
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Link
            href="/admin/dashboard"
            className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Dashboard
          </Link>
          <Link
            href="/admin/students"
            className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            View All Students
          </Link>
        </div>
      </div>
    </div>
  );
}
