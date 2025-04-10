"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import Link from "next/link";
import Header from "@/app/components/Header";

export default function AdminDashboard() {
  const router = useRouter();
  const { auth, logout } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated and is an admin
    if (!auth.loading) {
      setLoading(false);
      if (!auth.isAuthenticated) {
        router.push("/login");
      } else if (auth.role !== "admin") {
        router.push("/");
      }
    }
  }, [auth, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-200">
        <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-200">
      {/* Navigation Header */}
      {/* <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img
                src="/logo.jpg"
                alt="UET Logo"
                className="h-16 w-16 rounded-full"
              />
              <span className="ml-3 text-2xl font-semibold text-gray-800">
                Admin Dashboard
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-700 mr-4">
                Welcome, {auth.user?.name || "Admin"}
              </span>
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition duration-300 shadow-md hover:shadow-lg"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav> */}
      <Header title="Admin Dashboard" auth={auth} logout={logout} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-semibold text-gray-900 mb-6">
            Admin Control Panel
          </h1>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Link
              href="/admin/add-student"
              className="bg-white overflow-hidden shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow duration-300 flex flex-col items-center"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-8 h-8 text-blue-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z"
                  />
                </svg>
              </div>
              <h2 className="text-lg font-medium text-gray-900">
                Add Single Student
              </h2>
              <p className="mt-2 text-sm text-gray-600 text-center">
                Add a new student to the system with their details
              </p>
            </Link>

            <Link
              href="/admin/upload-students"
              className="bg-white overflow-hidden shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow duration-300 flex flex-col items-center"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-8 h-8 text-green-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                  />
                </svg>
              </div>
              <h2 className="text-lg font-medium text-gray-900">
                Upload Bulk Students
              </h2>
              <p className="mt-2 text-sm text-gray-600 text-center">
                Upload multiple students at once using a CSV file
              </p>
            </Link>

            <Link
              href="/admin/students"
              className="bg-white overflow-hidden shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow duration-300 flex flex-col items-center"
            >
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-8 h-8 text-purple-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                  />
                </svg>
              </div>
              <h2 className="text-lg font-medium text-gray-900">
                View Students
              </h2>
              <p className="mt-2 text-sm text-gray-600 text-center">
                View and manage all student records and clearance statuses
              </p>
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="bg-white shadow-lg rounded-lg mb-8 p-6">
            <div className="flex justify-between items-center border-b pb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                System Overview
              </h3>
              <span className="text-sm text-gray-500">
                Last Updated: {new Date().toLocaleString()}
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Quick statistics about the clearance management system
            </p>
            <div className="mt-4">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-100 p-4 rounded-lg shadow">
                  <dt className="text-sm font-medium text-gray-600">
                    Total Students
                  </dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-800">
                    2
                  </dd>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg shadow">
                  <dt className="text-sm font-medium text-gray-600">
                    Students with Complete Clearance
                  </dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-800">
                    1
                  </dd>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg shadow">
                  <dt className="text-sm font-medium text-gray-600">
                    Pending Clearances
                  </dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-800">
                    1
                  </dd>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg shadow">
                  <dt className="text-sm font-medium text-gray-600">
                    Last Update
                  </dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-800">
                    {new Date().toLocaleString()}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
          {/* Back to Dashboard Link */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <Link
              href="/"
              className="rounded-lg bg-gray-300 px-4 py-2 text-gray-700 font-semibold shadow-md hover:bg-gray-300 transition-colors duration-200 flex items-center justify-center"
            >
              Back to Home
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
