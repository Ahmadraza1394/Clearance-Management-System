"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, logout } from "../../../context/AuthContext";
import { useStudents } from "../../../context/StudentContext";
import Link from "next/link";
import Header from "@/app/components/Header";

export default function UpdateStudentStatus({ params }) {
  const studentId = params.id;
  const router = useRouter();
  const { auth } = useAuth();
  const { getStudentById, updateStudentStatus } = useStudents();

  const [student, setStudent] = useState(null);
  const [clearanceStatus, setClearanceStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    // Check if user is authenticated and is an admin
    if (!auth.loading) {
      if (!auth.isAuthenticated) {
        router.push("/login");
      } else if (auth.role !== "admin") {
        router.push("/");
      } else {
        // Get student data
        const studentData = getStudentById(studentId);
        if (studentData) {
          setStudent(studentData);
          setClearanceStatus(studentData.clearance_status);
        } else {
          // Student not found, redirect back to student list
          router.push("/admin/students");
        }
        setLoading(false);
      }
    }
  }, [auth, router, studentId, getStudentById]);

  const handleStatusChange = (department, value) => {
    setClearanceStatus((prev) => ({
      ...prev,
      [department]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateStudentStatus(studentId, clearanceStatus);
    setSaveSuccess(true);

    // Reset save success message after 3 seconds
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
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
      <Header title={"Update Clearance Status"} auth={auth} logout={logout} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">
              Update Clearance Status
            </h1>
            <Link
              href="/admin/students"
              className="text-blue-600 hover:text-blue-900"
            >
              Back to Student List
            </Link>
          </div>

          {/* Student Information */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Student Information
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Personal details and application info.
              </p>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Full name
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {student?.name}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Roll number
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {student?.roll_number}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Save Success Message */}
          {saveSuccess && (
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
                    Clearance status updated successfully
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Update Clearance Status Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-8 divide-y divide-gray-200"
          >
            <div className="space-y-8">
              {/* Header Section: Modernized with bolder typography and a subtle underline effect */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                  Clearance Status
                </h3>
                <p className="mt-2 text-base text-gray-600 leading-relaxed">
                  Update the student's clearance status for each department.
                </p>
                <div className="mt-2 h-1 w-16 bg-blue-500 rounded-full" />{" "}
                {/* Decorative underline */}
              </div>

              {/* Grid Section: Enhanced with card-like containers and hover effects */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {clearanceStatus &&
                  Object.entries(clearanceStatus).map(
                    ([department, status]) => (
                      <div key={department} className="col-span-1">
                        <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                          <div className="flex items-center space-x-4">
                            {/* Checkbox: Larger, with a modern focus ring */}
                            <div className="flex items-center">
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
                                className="h-5 w-5 text-blue-600 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
                              />
                            </div>
                            {/* Label and Status: Improved typography and status badge */}
                            <div className="flex-1">
                              <label
                                htmlFor={department}
                                className="text-base font-semibold text-gray-800 capitalize"
                              >
                                {department.replace(/_/g, " ")}
                              </label>
                              <p
                                className={`mt-1 text-sm font-medium ${
                                  status ? "text-green-600" : "text-red-600"
                                }`}
                              >
                                {status ? (
                                  <span className="inline-flex items-center px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
                                    Cleared
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">
                                    Not Cleared
                                  </span>
                                )}
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
                  href="/admin/students"
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </form>
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
            View all Students
          </Link>
        </div>
      </div>
    </div>
  );
}
