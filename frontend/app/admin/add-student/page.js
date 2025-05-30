"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useStudents } from "../../context/StudentContext";
import Link from "next/link";
import Header from "@/app/components/Header";

export default function AddStudent() {
  const router = useRouter();
  const { auth, logout } = useAuth();
  const { addStudent } = useStudents();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    roll_number: "",
    user_id: "",
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

    if (!formData.user_id.trim()) {
      newErrors.user_id = "User ID is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      // Add the student
      const result = addStudent(formData);
      
      if (result.success) {
        setSuccess(true);
        setErrorMessage("");

        // Reset form
        setFormData({
          name: "",
          roll_number: "",
          user_id: "",
          clearance_status: {
            dispensary: false,
            hostel: false,
            due: false,
            library: false,
            academic_department: false,
            alumni: false,
          },
        });

        // Reset success message after 3 seconds
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      } else {
        // Display error message
        setErrorMessage(result.message);
        setSuccess(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Header */}
      <Header title={"Add New Student"} auth={auth} logout={logout} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">
              Add New Student
            </h1>
            {/* <Link
              href="/admin/dashboard"
              className="text-blue-600 hover:text-blue-900"
            >
              Back to Dashboard
            </Link> */}
          </div>

          {/* Success Message */}
          {success && (
            <div className="rounded-md bg-green-50 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    Student added successfully!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="rounded-md bg-red-50 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">
                    {errorMessage}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Add Student Form */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Student Information
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Enter the details of the new student.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Full name
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="name"
                          id="name"
                          value={formData.name}
                          onChange={handleChange}
                          className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            errors.name ? "border-red-300" : ""
                          }`}
                        />
                        {errors.name && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.name}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label
                        htmlFor="roll_number"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Roll number
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="roll_number"
                          id="roll_number"
                          value={formData.roll_number}
                          onChange={handleChange}
                          className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            errors.roll_number ? "border-red-300" : ""
                          }`}
                        />
                        {errors.roll_number && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.roll_number}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="sm:col-span-6">
                      <label
                        htmlFor="user_id"
                        className="block text-sm font-medium text-gray-700"
                      >
                        User ID (for login)
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="user_id"
                          id="user_id"
                          value={formData.user_id}
                          onChange={handleChange}
                          className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            errors.user_id ? "border-red-300" : ""
                          }`}
                        />
                        {errors.user_id && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.user_id}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Initial Clearance Status
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Set the initial clearance status for each department.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                    {Object.entries(formData.clearance_status).map(
                      ([department, status]) => (
                        <div key={department} className="col-span-1">
                          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                            <div className="relative flex items-start">
                              <div className="flex items-center h-5">
                                <input
                                  id={department}
                                  name={department}
                                  type="checkbox"
                                  checked={status}
                                  onChange={(e) =>
                                    handleStatusChange(
                                      department,
                                      e.target.checked
                                    )
                                  }
                                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                />
                              </div>
                              <div className="ml-3 text-sm">
                                <label
                                  htmlFor={department}
                                  className="font-medium text-gray-700 capitalize"
                                >
                                  {department.replace(/_/g, " ")}
                                </label>
                                <p
                                  className={`text-gray-500 ${
                                    status ? "text-green-500" : ""
                                  }`}
                                >
                                  {status ? "Cleared" : "Not cleared"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div className="pt-5">
                  <div className="flex justify-end">
                    <Link
                      href="/admin/dashboard"
                      className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </Link>
                    <button
                      type="submit"
                      className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Add Student
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <Link
              href="/admin/dashboard"
              className="rounded-lg bg-gray-300 px-4 py-2 text-gray-700 font-semibold shadow-md hover:bg-gray-300 transition-colors duration-200 flex items-center justify-center"
            >
              Back to Dashboard
            </Link>
            <Link
              href="/admin/students"
              className="rounded-lg bg-blue-600 px-4 py-2 text-white font-semibold shadow-md hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
            >
              View All Students
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
