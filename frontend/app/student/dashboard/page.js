"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useStudents } from "../../context/StudentContext";
import { useNotifications } from "../../context/NotificationContext";
import Link from "next/link";
import Header from "@/app/components/Header";
import FileUpload from "@/app/components/FileUpload";
import DocumentViewer from "@/app/components/FileUpload/DocumentViewer";
import NotificationPanel from "@/app/components/NotificationPanel";
import apiService from "@/app/utils/api";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaFileDownload,
  FaLock,
  FaFileUpload,
  FaFile,
} from "react-icons/fa";

export default function StudentDashboard() {
  const router = useRouter();
  const { auth, logout } = useAuth();
  const {
    getStudentById,
    uploadDocument,
    getStudentDocuments,
    deleteDocument,
  } = useStudents();
  const { notifications } = useNotifications();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Memoize the studentId to prevent unnecessary re-renders
  const studentId = useMemo(() => {
    return auth.user?.email || auth.user?.id;
  }, [auth.user]);

  // Define fetchStudentData as a useCallback to prevent recreation on each render
  const fetchStudentData = useCallback(async () => {
    if (!studentId) return;
    
    try {
      // Try to get from localStorage cache first
      const cachedData = localStorage.getItem(`student_${studentId}`);
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        const cacheTime = parsedData.timestamp;
        // Use cache if it's less than 5 minutes old
        if (Date.now() - cacheTime < 5 * 60 * 1000) {
          setStudent(parsedData.data);
          setLoading(false);
          console.log('Loaded student data from cache');
          return;
        }
      }
      
      // Fetch from API if cache is invalid or doesn't exist
      const data = await apiService.get(`/students/${studentId}`);
      setStudent(data);
      
      // Update cache
      localStorage.setItem(`student_${studentId}`, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
      
      console.log('Loaded student data from backend API');
    } catch (error) {
      console.error("Error fetching student data from API:", error);
      
      // Fallback to local data if API fails
      const studentData = auth.user?.email
        ? getStudentById(auth.user.email) // First try using email (user_id)
        : getStudentById(auth.user.id); // Fall back to id
      
      if (studentData) {
        setStudent(studentData);
        console.log('Loaded student data from local storage (fallback)');
      } else {
        console.error("Could not find student data for", studentId);
      }
    } finally {
      setLoading(false);
    }
  }, [studentId, getStudentById, auth.user]);

  useEffect(() => {
    // Check if user is authenticated and is a student
    if (!auth.loading) {
      if (!auth.isAuthenticated) {
        router.push("/login");
        return;
      } else if (auth.role !== "student") {
        router.push("/");
        return;
      }

      fetchStudentData();
    }
  }, [auth, router, fetchStudentData]);

  // Memoize the loading component to prevent unnecessary re-renders
  const loadingComponent = useMemo(() => (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-r from-blue-50 to-indigo-50">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 border-opacity-75"></div>
        <p className="mt-4 text-blue-600 font-medium">
          Loading your dashboard...
        </p>
      </div>
    </div>
  ), []);

  // Define helper functions outside the component body or return statement
  // Memoize the isFullyCleared function
  const isFullyCleared = useCallback((studentData) => {
    if (!studentData || !studentData.clearance_status) return false;
    return Object.values(studentData.clearance_status).every(status => status === true);
  }, []);
  
  // Calculate derived state values using useMemo
  const dashboardStats = useMemo(() => {
    if (!student) return { allCleared: false, totalDepartments: 0, clearedDepartments: 0, completionPercentage: 0 };
    
    const allCleared = isFullyCleared(student);
    
    const totalDepartments = student.clearance_status
      ? Object.keys(student.clearance_status).length
      : 0;
      
    const clearedDepartments = student.clearance_status
      ? Object.values(student.clearance_status).filter((status) => status).length
      : 0;
      
    const completionPercentage =
      totalDepartments > 0
        ? Math.round((clearedDepartments / totalDepartments) * 100)
        : 0;
        
    return { allCleared, totalDepartments, clearedDepartments, completionPercentage };
  }, [student, isFullyCleared]);
  
  // Destructure the stats
  const { allCleared, totalDepartments, clearedDepartments, completionPercentage } = dashboardStats;
  
  if (loading) {
    return loadingComponent;
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-50">
      {/* Navigation Header */}
      <div className="relative">
        <Header title={"Student Dashboard"} auth={auth} logout={logout} />
        <div className="absolute top-4 right-20">
          <NotificationPanel />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-4 sm:py-8 px-3 sm:px-6 lg:px-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-800 to-blue-900 rounded-xl shadow-xl p-6 mb-8 text-white">
          <div className="flex bg-gradient-to-r from-blue-800 to-blue-900 flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">
                Welcome, {student?.name || "Student"}!
              </h1>
              <p className="mt-2 text-blue-100">
                Track and manage your clearance process
              </p>
            </div>
            <div className="mt-4 md:mt-0 bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-center">
                <p className="text-lg font-medium">Overall Clearance</p>
                <div className="flex items-center justify-center mt-2">
                  <div className="relative h-24 w-24">
                    <svg className="h-24 w-24" viewBox="0 0 100 100">
                      <circle
                        className="text-blue-300 opacity-25"
                        cx="50"
                        cy="50"
                        r="45"
                        stroke="currentColor"
                        strokeWidth="10"
                        fill="none"
                      />
                      <circle
                        className="text-white"
                        cx="50"
                        cy="50"
                        r="45"
                        stroke="currentColor"
                        strokeWidth="10"
                        fill="none"
                        strokeDasharray="283"
                        strokeDashoffset={
                          283 - (283 * completionPercentage) / 100
                        }
                        strokeLinecap="round"
                        transform="rotate(-90 50 50)"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold">
                        {completionPercentage}%
                      </span>
                    </div>
                  </div>
                </div>
                <p className="mt-2 text-sm">
                  {allCleared
                    ? "All departments cleared!"
                    : `${clearedDepartments}/${totalDepartments} departments cleared`}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Student Information Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4">
                <h3 className="text-xl font-bold text-white">
                  Student Information
                </h3>
              </div>
              <div className="p-6">
                <div className="flex items-center mb-6">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {student?.name || "N/A"}
                    </h4>
                    <p className="text-gray-600">
                      {student?.roll_number || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center border-b border-gray-200 pb-3">
                    <span className="text-gray-600 w-20">Email:</span>
                    <span className="text-sm text-gray-900 flex-1">
                      {student?.email || "N/A"}
                    </span>
                  </div>

                  <div className="flex items-center border-b border-gray-200 pb-3">
                    <span className="text-gray-600 w-24">Status:</span>
                    <span
                      className={`font-medium px-3 py-1 rounded-full text-sm ${
                        allCleared
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {allCleared ? "Fully Cleared" : "Clearance Pending"}
                    </span>
                  </div>

                  {student?.clearance_date && (
                    <div className="flex items-center pb-3">
                      <span className="text-gray-600 w-24">Cleared on:</span>
                      <span className="font-medium text-gray-900">
                        {new Date(student.clearance_date).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex space-x-3">
                  <Link
                    href="/student/change-password"
                    className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <FaLock className="mr-2" />
                    Change Password
                  </Link>
                </div>
              </div>
            </div>

            {/* Certificate Card */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden mt-6 transition-all duration-300 hover:shadow-xl">
              <div
                className={`px-6 py-4 ${
                  allCleared
                    ? "bg-gradient-to-r from-green-600 to-green-700"
                    : "bg-gradient-to-r from-gray-600 to-gray-700"
                }`}
              >
                <h3 className="text-xl font-bold text-white">
                  Clearance Certificate
                </h3>
              </div>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div
                    className={`p-3 rounded-full ${
                      allCleared
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <FaFileDownload className="h-8 w-8" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-900">
                      Clearance Certificate
                    </h4>
                    <p className="text-gray-500 text-sm">
                      {allCleared
                        ? "You are eligible to download your certificate"
                        : "Complete all clearances to download"}
                    </p>
                  </div>
                </div>

                <Link
                  href="/student/certificate"
                  className={`w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium ${
                    allCleared
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                  aria-disabled={!allCleared}
                >
                  <FaFileDownload className="mr-2" />
                  {allCleared
                    ? "Download Certificate"
                    : "Certificate Unavailable"}
                </Link>
              </div>
            </div>
          </div>

          {/* Department Clearance Status */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4">
                <h3 className="text-xl font-bold text-white">
                  Department Clearance Status
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {student &&
                    student.clearance_status &&
                    Object.entries(student.clearance_status).map(
                      ([department, status]) => {
                        // Fixed progress percentage for consistency
                        const progressPercentage = status ? 100 : 50;

                        return (
                          <div
                            key={department}
                            className={`border rounded-lg transition-all duration-300 transform hover:scale-105 ${
                              status ? "border-green-200" : "border-red-200"
                            }`}
                          >
                            <div className="p-5">
                              <div className="flex items-center">
                                <div
                                  className={`flex-shrink-0 rounded-full p-3 ${
                                    status ? "bg-green-100" : "bg-red-100"
                                  }`}
                                >
                                  {status ? (
                                    <FaCheckCircle className="h-8 w-8 text-green-600" />
                                  ) : (
                                    <FaTimesCircle className="h-8 w-8 text-red-600" />
                                  )}
                                </div>
                                <div className="ml-4 w-full">
                                  <h4 className="text-lg font-semibold text-gray-900 capitalize">
                                    {department.replace(/_/g, " ")}
                                  </h4>
                                  <p
                                    className={`mt-1 ${
                                      status ? "text-green-600" : "text-red-600"
                                    }`}
                                  >
                                    {status ? "Cleared" : "Pending"}
                                  </p>
                                  <div className="mt-2 w-full">
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                      <div
                                        className={`h-2.5 rounded-full ${
                                          status ? "bg-green-600" : "bg-red-600"
                                        }`}
                                        style={{
                                          width: `${progressPercentage}%`,
                                          transition: "width 0.5s ease-in-out",
                                        }}
                                      ></div>
                                    </div>
                                  </div>

                                  {/* Document Section */}
                                  <div className="mt-3 pt-3 border-t border-gray-200">
                                    <div className="flex justify-between items-center">
                                      <h5 className="text-sm font-medium text-gray-700 flex items-center">
                                        <FaFile className="mr-1 text-sm" />
                                        Documents
                                      </h5>
                                      <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                        Max: 5MB
                                      </span>
                                    </div>

                                    {/* Show uploaded documents */}
                                    <div className="mt-2">
                                      <DocumentViewer
                                        documents={
                                          student?.documents?.[department] || []
                                        }
                                        department={department}
                                        onDelete={async (dept, docId) => {
                                          try {
                                            // Try to delete document via API
                                            await apiService.delete(`/students/${student._id}/documents/${dept}/${docId}`);
                                            console.log('Document deleted via backend API');
                                            
                                            // Refresh student data after deletion
                                            const updatedData = await apiService.get(`/students/${student._id}`);
                                            setStudent(updatedData);
                                          } catch (error) {
                                            console.error('Error deleting document via API:', error);
                                            
                                            // Fallback to local storage if API fails
                                            deleteDocument(student._id, dept, docId);
                                            console.log('Document deleted from local storage (fallback)');
                                          }
                                        }}
                                      />
                                    </div>

                                    {/* Upload new document - more compact */}
                                    <div className="mt-2">
                                      <div className="bg-gray-50 border border-dashed border-gray-300 rounded-md p-2 hover:bg-gray-100 transition-colors">
                                        <FileUpload
                                          department={department}
                                          onUploadComplete={async (dept, doc) => {
                                            try {
                                              // Try to upload document via API
                                              await apiService.put(`/students/${student._id}/documents/${dept}`, { document: doc });
                                              console.log('Document uploaded via backend API');
                                              
                                              // Refresh student data after upload
                                              fetchStudentData();
                                            } catch (error) {
                                              console.error('Error uploading document via API:', error);
                                              
                                              // Fallback to local storage if API fails
                                              uploadDocument(student._id, dept, doc);
                                              console.log('Document uploaded to local storage (fallback)');
                                            }
                                          }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }
                    )}
                </div>

                {/* Information Notice */}
                <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-500"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        If you have any questions about your clearance status,
                        please contact the respective department or visit the
                        administrative office.
                      </p>
                      <p className="text-sm text-blue-700 mt-2">
                        <span className="font-medium">Document Upload:</span>{" "}
                        You can upload supporting documents for each department.
                        Accepted formats include PDF, Word, Excel, and images.
                        <br />
                        <span className="font-medium text-red-600">
                          Max Size:5MB
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
