"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useStudents } from "../../context/StudentContext";
import Link from "next/link";
import Header from "@/app/components/Header";
import { FaCheckCircle, FaExclamationCircle, FaSearch, FaUserPlus, FaArrowLeft } from "react-icons/fa";

export default function StudentList() {
  const router = useRouter();
  const { auth, logout } = useAuth();
  const { getAllStudents } = useStudents();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    // Check if user is authenticated and is an admin
    if (!auth.loading) {
      if (!auth.isAuthenticated) {
        router.push("/login");
      } else if (auth.role !== "admin") {
        router.push("/");
      } else {
        // Get all students
        const allStudents = getAllStudents();
        setStudents(allStudents);
        setLoading(false);
      }
    }
  }, [auth, router, getAllStudents]);

  // Check if all clearances for a student are complete
  const isFullyCleared = (student) => {
    return Object.values(student.clearance_status).every(
      (status) => status === true
    );
  };

  // Filter students based on search term and clearance status
  const filteredStudents = students.filter((student) => {
    const matchesSearchTerm =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.roll_number.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "cleared" && isFullyCleared(student)) ||
      (filterStatus === "pending" && !isFullyCleared(student));

    return matchesSearchTerm && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 border-opacity-75"></div>
          <p className="mt-4 text-blue-600 font-medium">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-50">
      <Header title={"Student Management"} auth={auth} logout={logout} />
      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-4 md:mb-0">
              Student Management
            </h1>
            <div className="w-full md:w-64 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search students..."
                className="pl-10 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="mt-4 md:mt-0 md:ml-4 flex gap-2">
              <button
                onClick={() => setFilterStatus("all")}
                className={`flex items-center px-4 py-2 rounded-md transition-colors duration-200 ${
                  filterStatus === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-blue-600 border border-blue-600 hover:bg-blue-50"
                }`}
              >
                All Students
              </button>
              <button
                onClick={() => setFilterStatus("cleared")}
                className={`flex items-center px-4 py-2 rounded-md transition-colors duration-200 ${
                  filterStatus === "cleared"
                    ? "bg-green-600 text-white"
                    : "bg-white text-green-600 border border-green-600 hover:bg-green-50"
                }`}
              >
                <FaCheckCircle className="mr-2" />
                Fully Cleared
              </button>
              <button
                onClick={() => setFilterStatus("pending")}
                className={`flex items-center px-4 py-2 rounded-md transition-colors duration-200 ${
                  filterStatus === "pending"
                    ? "bg-yellow-600 text-white"
                    : "bg-white text-yellow-600 border border-yellow-600 hover:bg-yellow-50"
                }`}
              >
                <FaExclamationCircle className="mr-2" />
                Pending
              </button>
            </div>
          </div>

          {/* Students Table */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Student
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Roll Number
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Clearance Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <tr key={student._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {student.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {student.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {student.roll_number}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isFullyCleared(student) ? (
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              <FaCheckCircle className="mr-1 mt-0.5" />
                              Fully Cleared
                            </span>
                          ) : (
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              <FaExclamationCircle className="mr-1 mt-0.5" />
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.clearance_date
                            ? new Date(
                                student.clearance_date
                              ).toLocaleDateString()
                            : "Not Cleared"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            href={`/admin/students/${student._id}`}
                            className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md transition-colors duration-200"
                          >
                            Update Status
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-10 text-center text-sm text-gray-500"
                      >
                        No students found matching your criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <Link
              href="/admin/dashboard"
              className="rounded-lg bg-white px-4 py-2 text-gray-700 font-semibold shadow-md hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center border border-gray-300"
            >
              <FaArrowLeft className="mr-2" />
              Back to Dashboard
            </Link>
            <Link
              href="/admin/add-student"
              className="rounded-lg bg-blue-600 px-4 py-2 text-white font-semibold shadow-md hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
            >
              <FaUserPlus className="mr-2" />
              Add New Student
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
