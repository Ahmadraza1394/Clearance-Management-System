"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useStudents } from "../../context/StudentContext";
import Link from "next/link";
import Header from "@/app/components/Header";
import { FaSearch, FaCheckCircle, FaTimesCircle, FaArrowLeft, FaIdCard } from "react-icons/fa";
import apiService from "@/app/utils/api";

export default function VerifyCertificate() {
  const router = useRouter();
  const { auth, logout } = useAuth();
  const { getStudentById } = useStudents();
  
  const [studentId, setStudentId] = useState("");
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [verified, setVerified] = useState(false);

  // Check if student is fully cleared
  const checkClearanceStatus = (student) => {
    if (!student || !student.clearance_status) return false;
    return Object.values(student.clearance_status).every(status => status === true);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setStudent(null);
    setVerified(false);
    
    if (!studentId.trim()) {
      setError("Please enter a student Certificate ID, or email");
      return;
    }
    
    setLoading(true);
    
    try {
      // Try to get student from backend API
      const studentData = await apiService.get(`/students/${studentId}`);
      if (studentData) {
        setStudent(studentData);
        setVerified(true);
      } else {
        setError("Student not found");
      }
    } catch (apiError) {
      console.error("Error fetching student from API:", apiError);
      
      // Fallback to local storage
      const localStudent = getStudentById(studentId);
      if (localStudent) {
        setStudent(localStudent);
        setVerified(true);
      } else {
        setError("Student not found");
      }
    } finally {
      setLoading(false);
    }
  };

  // Redirect if not admin
  if (!auth.loading && (!auth.isAuthenticated || auth.role !== "admin")) {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-50 to-gray-100">
      {/* Navigation Header */}
      <Header title={"Verify Certificate"} auth={auth} logout={logout} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700">
            <h1 className="text-2xl font-bold text-white">
              Certificate Verification
            </h1>
            <p className="text-blue-100 mt-2">
              Verify the authenticity of a student's clearance certificate
            </p>
          </div>

          <div className="p-6">
            <form onSubmit={handleVerify} className="mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-grow">
                  <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-1">
                    Enter Student Certificate ID or Email
                  </label>
                  <input
                    type="text"
                    id="studentId"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="e.g., yx34k5h3li2 or 21-se-32@studentsuettaxila.edu.pk"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="self-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 h-10"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <FaSearch className="mr-2" /> Verify
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              {error && (
                <div className="mt-3 text-sm text-red-600">
                  {error}
                </div>
              )}
            </form>

            {verified && student && (
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">Certificate Verification Result</h2>
                  <div className={`flex items-center ${checkClearanceStatus(student) ? 'text-green-600' : 'text-red-600'}`}>
                    {checkClearanceStatus(student) ? (
                      <>
                        <FaCheckCircle className="mr-2" />
                        <span className="font-medium">Valid Certificate</span>
                      </>
                    ) : (
                      <>
                        <FaTimesCircle className="mr-2" />
                        <span className="font-medium">Not Cleared</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Student Name</h3>
                    <p className="text-lg font-medium text-gray-900">{student.name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Roll Number</h3>
                    <p className="text-lg font-medium text-gray-900">{student.roll_number}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Student ID</h3>
                    <p className="text-lg font-medium text-gray-900">{student.user_id}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Email</h3>
                    <p className="text-lg font-medium text-gray-900">{student.email}</p>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Clearance Status</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(student.clearance_status).map(([department, status]) => (
                      <div key={department} className="flex items-center">
                        {status ? (
                          <FaCheckCircle className="text-green-500 mr-2" />
                        ) : (
                          <FaTimesCircle className="text-red-500 mr-2" />
                        )}
                        <span className="capitalize">{department.replace('_', ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {checkClearanceStatus(student) && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center text-green-700">
                      <FaIdCard className="mr-2" />
                      <span className="font-medium">This student has been fully cleared and their certificate is valid.</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-start">
              <Link
                href="/admin/dashboard"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FaArrowLeft className="mr-2" />
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
