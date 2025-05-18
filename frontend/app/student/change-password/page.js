"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, logout } from "../../context/AuthContext";
import { useStudents } from "../../context/StudentContext";
import Link from "next/link";
import Header from "@/app/components/Header";
import { FaEye, FaEyeSlash, FaLock, FaArrowLeft, FaSignOutAlt } from "react-icons/fa";

export default function ChangePassword() {
  const router = useRouter();
  const { auth } = useAuth();
  const { updatePassword, getStudentById } = useStudents();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    // Check if user is authenticated and is a student
    if (!auth.loading) {
      if (!auth.isAuthenticated) {
        router.push("/login");
      } else if (auth.role !== "student") {
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
    // Clear error when user types
    if (error) setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Get current student data - use email if available, otherwise fall back to ID
    const studentId = auth.user.email || auth.user.id;
    const student = auth.user.email
      ? getStudentById(studentId)
      : getStudentById(auth.user.id);

    if (!student) {
      setError("Student not found");
      return;
    }

    // Validate current password
    if (student.password !== formData.currentPassword) {
      setError("Current password is incorrect");
      return;
    }

    // Validate new password
    if (formData.newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }

    // Validate confirmation password
    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    // Update password
    try {
      updatePassword(studentId, formData.newPassword);
      setSuccess(true);

      // Reset form
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push("/student/dashboard");
      }, 2000);
    } catch (err) {
      setError("Failed to update password");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 border-opacity-75"></div>
          <p className="mt-4 text-blue-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-50">
      <Header title={"Change Password"} auth={auth} logout={logout} />

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="bg-blue-600 px-6 py-4">
            <div className="flex items-center">
              <FaLock className="text-white mr-3 text-xl" />
              <h2 className="text-xl font-bold text-white">Change Your Password</h2>
            </div>
            <p className="text-blue-100 mt-1 text-sm">
              Keep your account secure with a strong password
            </p>
          </div>

          <div className="p-6">
            {success && (
              <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-md flex items-center">
                <svg className="h-5 w-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Password updated successfully! </span>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md flex items-center">
                <svg className="h-5 w-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                  Current Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    name="currentPassword"
                    id="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    required
                    className="block w-full pr-10 focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    id="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    required
                    className="block w-full pr-10 focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">Password must be at least 6 characters long</p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="block w-full pr-10 focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  <FaLock className="mr-2" />
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/student/dashboard"
            className="rounded-md bg-white px-4 py-2 text-gray-700 font-medium shadow-md hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center border border-gray-300"
          >
            <FaArrowLeft className="mr-2" />
            Back to Dashboard
          </Link>
          <Link
            href="/login"
            className="rounded-md bg-blue-600 px-4 py-2 text-white font-medium shadow-md hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
          >
            <FaSignOutAlt className="mr-2" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
