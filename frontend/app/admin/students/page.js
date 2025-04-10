"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useStudents } from "../../context/StudentContext";
import Link from "next/link";
import Header from "@/app/components/Header";
import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa"; // Importing icons

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
      <div className="min-h-screen flex justify-center items-center bg-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header title={"Student Management"} auth={auth} logout={logout} />
      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-4 md:mb-0">
              Student Management
            </h1>
            <div className="w-full md:w-64">
              <input
                type="text"
                placeholder="Search students..."
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="mt-4 md:mt-0 md:ml-4 flex gap-2">
              <button
                onClick={() => setFilterStatus("cleared")}
                className={`flex items-center px-4 py-2 rounded-md transition-colors duration-200 ${
                  filterStatus === "cleared"
                    ? "bg-green-600 text-white"
                    : "bg-green-500 text-white hover:bg-green-600"
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
                    : "bg-yellow-500 text-white hover:bg-yellow-600"
                }`}
              >
                <FaExclamationCircle className="mr-2" />
                Pending
              </button>
            </div>
          </div>

          {/* Students Table */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
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
                      <tr key={student._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {student.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {student.roll_number}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isFullyCleared(student) ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Fully Cleared
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
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
                            className="text-blue-600 hover:text-blue-900"
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
                        className="px-6 py-4 text-center text-sm text-gray-500"
                      >
                        No students found
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
              className="rounded-lg bg-gray-200 px-4 py-2 text-gray-700 font-semibold shadow-md hover:bg-gray-300 transition-colors duration-200 flex items-center justify-center"
            >
              Back to Dashboard
            </Link>
            <Link
              href="/admin/add-student"
              className="rounded-lg bg-blue-600 px-4 py-2 text-white font-semibold shadow-md hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
            >
              Add New Student
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
