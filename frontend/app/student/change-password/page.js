"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, logout } from "../../context/AuthContext";
import { useStudents } from "../../context/StudentContext";
import Link from "next/link";
import Header from "@/app/components/Header";

export default function ChangePassword() {
  const router = useRouter();
  const { auth } = useAuth();
  const { updatePassword, getStudentById } = useStudents();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

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
      <div className="min-h-screen flex justify-center items-center bg-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header title={"Change Password"} auth={auth} logout={logout} />

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Change Password
              </h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>Update your account password for security.</p>
              </div>

              {success && (
                <div className="mt-4 p-4 bg-green-100 text-green-700 rounded-md">
                  Password updated successfully! Redirecting to dashboard...
                </div>
              )}

              {error && (
                <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
                  {error}
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                className="mt-5 sm:flex sm:flex-col"
              >
                <div className="mb-4">
                  <label
                    htmlFor="currentPassword"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    id="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full sm:max-w-xs shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-medium text-gray-700"
                  >
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    id="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full sm:max-w-xs shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full sm:max-w-xs shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div className="mt-5">
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <Link
              href="/student/dashboard"
              className="rounded-lg bg-gray-300 px-4 py-2 text-gray-700 font-semibold shadow-md hover:bg-gray-300 transition-colors duration-200 flex items-center justify-center"
            >
              Back to Dashboard
            </Link>
            <Link
              href="/login"
              className="rounded-lg bg-blue-600 px-4 py-2 text-white font-semibold shadow-md hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
