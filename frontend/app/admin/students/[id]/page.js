"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { useStudents } from "@/app/context/StudentContext";
import Link from "next/link";
import Header from "@/app/components/Header";
import DocumentViewer from "@/app/components/FileUpload/DocumentViewer";
import CenterNotification from "@/app/components/CenterNotification";
import { FaCheckCircle, FaTimesCircle, FaArrowLeft, FaSave, FaUser, FaIdCard, FaFile, FaFolderOpen } from "react-icons/fa";
import apiService from "@/app/utils/api";
import { use } from 'react';

export default function UpdateStudentStatus({ params }) {
  // Unwrap params using React.use() to avoid the warning
  const unwrappedParams = use(params);
  const studentId = unwrappedParams.id;
  const router = useRouter();
  const { auth,logout } = useAuth();
  const { getStudentById, updateStudentStatus, getStudentDocuments } = useStudents();

  const [student, setStudent] = useState(null);
  const [clearanceStatus, setClearanceStatus] = useState({});
  const [loading, setLoading] = useState(true);
  
  // Notification state
  const [notification, setNotification] = useState({
    show: false,
    type: 'success',
    message: ''
  });

  useEffect(() => {
    // Check if user is authenticated and is an admin
    if (!auth.loading) {
      if (!auth.isAuthenticated) {
        router.push("/login");
        return;
      } else if (auth.role !== "admin") {
        router.push("/");
        return;
      }
      
      // Fetch student data from backend API
      const fetchStudentData = async () => {
        try {
          const data = await apiService.get(`/students/${studentId}`);
          setStudent(data);
          setClearanceStatus(data.clearance_status);
          console.log('Loaded student data from backend API');
        } catch (error) {
          console.error("Error fetching student data from API:", error);
          
          // Fallback to local data if API fails
          const studentData = getStudentById(studentId);
          if (studentData) {
            setStudent(studentData);
            setClearanceStatus(studentData.clearance_status);
            console.log('Loaded student data from local storage (fallback)');
          } else {
            // Student not found, redirect back to student list
            router.push("/admin/students");
          }
        } finally {
          setLoading(false);
        }
      };
      
      fetchStudentData();
    }
  }, [auth, router, studentId, getStudentById]);

  const handleStatusChange = (department, value) => {
    setClearanceStatus((prev) => ({
      ...prev,
      [department]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Update student status via API
      await apiService.put(`/admin/students/${studentId}/status`, { clearance_status: clearanceStatus });
      console.log('Updated student status via backend API');
      
      // Show success notification
      setNotification({
        show: true,
        type: 'success',
        message: 'Student clearance status updated successfully!'
      });
    } catch (error) {
      console.error("Error updating student status via API:", error);
      
      // Fallback to local update if API fails
      updateStudentStatus(studentId, clearanceStatus);
      console.log('Updated student status in local storage (fallback)');
      
      // Show success notification (fallback worked)
      setNotification({
        show: true,
        type: 'success',
        message: 'Student clearance status updated successfully!'
      });
    }
  };
  
  // Handle closing the notification
  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, show: false }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading student data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-50 to-gray-100">
      {/* Navigation Header */}
      <Header title={"Update Clearance Status"} auth={auth} logout={logout} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <Link href="/admin/dashboard" className="text-gray-500 hover:text-gray-700">
                Dashboard
              </Link>
            </li>
            <li className="flex items-center">
              <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <Link href="/admin/students" className="ml-2 text-gray-500 hover:text-gray-700">
                Students
              </Link>
            </li>
            <li className="flex items-center">
              <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="ml-2 text-gray-700 font-medium">Update Status</span>
            </li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Update Clearance Status
            </h1>
            <p className="mt-2 text-gray-600">
              Manage and update student's departmental clearances
            </p>
          </div>
          <Link
            href="/admin/students"
            className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors duration-200"
          >
            <FaArrowLeft className="mr-2" /> Back to Students
          </Link>
        </div>

        {/* Success messages now handled by the CenterNotification component */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Student Information Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md overflow-hidden h-full">
              <div className="bg-blue-600 px-6 py-4">
                <h3 className="text-lg font-semibold text-white">
                  Student Information
                </h3>
              </div>
              <div className="p-6 space-y-6 flex flex-col h-[calc(100%-64px)]">
                <div className="flex items-center">
                  <div className="bg-blue-100 rounded-full p-3">
                    <FaUser className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="text-base font-medium text-gray-900">{student?.name}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="bg-blue-100 rounded-full p-3">
                    <FaIdCard className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">Roll Number</p>
                    <p className="text-base font-medium text-gray-900">{student?.roll_number}</p>
                  </div>
                </div>
                
                <div className="flex-1"></div> {/* Spacer to push content down */}
                
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Clearance Progress
                  </h4>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ 
                        width: `${Object.values(clearanceStatus).filter(Boolean).length / Object.values(clearanceStatus).length * 100}%` 
                      }}
                    ></div>
                  </div>
                  <p className="mt-2 text-xs text-gray-500 text-right">
                    {Object.values(clearanceStatus).filter(Boolean).length} of {Object.values(clearanceStatus).length} cleared
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Update Clearance Status Form */}
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-xl shadow-md overflow-hidden h-full"
            >
              <div className="bg-blue-600 px-6 py-4">
                <h3 className="text-lg font-semibold text-white">
                  Department Clearances
                </h3>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {clearanceStatus &&
                    Object.entries(clearanceStatus).map(([department, status]) => (
                      <div key={department} className="col-span-1">
                        <div 
                          className={`relative overflow-hidden rounded-lg border ${
                            status ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                          } p-5 transition-all duration-300 hover:shadow-md`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <label
                                htmlFor={department}
                                className="text-base font-medium capitalize cursor-pointer"
                              >
                                {department.replace(/_/g, " ")}
                              </label>
                            </div>
                            
                            <div className="flex items-center">
                              <span 
                                className={`inline-flex items-center mr-3 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  status 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {status ? 'Cleared' : 'Pending'}
                              </span>
                              
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  className="sr-only peer"
                                  checked={status}
                                  onChange={(e) => handleStatusChange(department, e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-red-400 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-400"></div>
                              </label>
                            </div>
                          </div>
                          
                          {status ? (
                            <FaCheckCircle className="absolute bottom-2 right-2 text-green-200 opacity-30 h-12 w-12" />
                          ) : (
                            <FaTimesCircle className="absolute bottom-2 right-2 text-red-200 opacity-30 h-12 w-12" />
                          )}
                          
                          {/* Document Section */}
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <h5 className="text-sm font-medium text-gray-700 flex items-center">
                              <FaFolderOpen className="mr-2 text-blue-500" />
                              Submitted Documents
                            </h5>
                            
                            {/* Show uploaded documents */}
                            <div className="mt-2">
                              <DocumentViewer 
                                documents={student?.documents?.[department] || []} 
                                department={department}
                                readOnly={true}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
                
                <div className="mt-8 flex justify-end">
                  <Link
                    href="/admin/students"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    className="ml-4 inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  >
                    <FaSave className="mr-2" /> Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
        
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/admin/dashboard"
            className="rounded-lg bg-white px-6 py-3 text-gray-700 font-medium shadow-md hover:bg-gray-50 border border-gray-200 transition-all duration-200 flex items-center justify-center"
          >
            Back to Dashboard
          </Link>
          <Link
            href="/admin/students"
            className="rounded-lg bg-blue-600 px-6 py-3 text-white font-medium shadow-md hover:bg-blue-700 transition-all duration-200 flex items-center justify-center"
          >
            View all Students
          </Link>
        </div>
      </div>
      
      {/* Center Notification */}
      <CenterNotification
        show={notification.show}
        type={notification.type}
        message={notification.message}
        onClose={handleCloseNotification}
        duration={3000}
      />
    </div>
  );
}
