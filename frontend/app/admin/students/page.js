"use client";
import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useStudents } from "../../context/StudentContext";
import Link from "next/link";
import Header from "@/app/components/Header";
import CenterNotification from "@/app/components/CenterNotification";
import { FaCheckCircle, FaExclamationCircle, FaSearch, FaUserPlus, FaArrowLeft, FaTrash, FaEdit, FaBell, FaEnvelope } from "react-icons/fa";
import apiService from "@/app/utils/api";

export default function StudentList() {
  const router = useRouter();
  const { auth, logout } = useAuth();
  const { getAllStudents, deleteStudent } = useStudents();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [studentToNotify, setStudentToNotify] = useState(null);
  const [notification, setNotification] = useState({ title: '', message: '' });
  
  // Center notification state
  const [centerNotification, setCenterNotification] = useState({
    show: false,
    type: 'success',
    message: ''
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(15);

  // Memoized function to fetch students data
  const fetchStudents = useCallback(async () => {
    try {
      const data = await apiService.get('/admin/students');
      setStudents(data);
    } catch (error) {
      console.error("Error fetching students from API:", error);
      
      // Fallback to local data if API fails
      const allStudents = getAllStudents();
      setStudents(allStudents);
    } finally {
      setLoading(false);
    }
  }, [getAllStudents]);

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
      
      // Fetch students data
      fetchStudents();
    }
  }, [auth, router, fetchStudents]);

  // Memoized function to check if all clearances for a student are complete
  const isFullyCleared = useCallback((student) => {
    return Object.values(student.clearance_status).every(
      (status) => status === true
    );
  }, []);
  
  // Memoized filtered students based on search term and filter status
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      // Filter by search term
      const matchesSearch = 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.roll_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by clearance status
      const studentCleared = isFullyCleared(student);
      const matchesFilter = 
        filterStatus === "all" ||
        (filterStatus === "cleared" && studentCleared) ||
        (filterStatus === "pending" && !studentCleared);
      
      return matchesSearch && matchesFilter;
    });
  }, [students, searchTerm, filterStatus, isFullyCleared]);
  
  // Memoized paginated students
  const paginatedStudents = useMemo(() => {
    const indexOfLastStudent = currentPage * studentsPerPage;
    const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
    return filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  }, [filteredStudents, currentPage, studentsPerPage]);
  
  // Memoized event handlers to prevent unnecessary re-renders
  
  // Handle delete student
  const handleDeleteClick = useCallback((student) => {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  }, []);
  
  const handleConfirmDelete = useCallback(async () => {
    if (!studentToDelete) return;
    
    try {
      // Delete student via API
      await apiService.delete(`/admin/students/${studentToDelete._id}`);
      console.log('Student deleted via backend API');
      
      // Update local state to remove the student
      setStudents(prev => prev.filter(s => s._id !== studentToDelete._id));
      setShowDeleteModal(false);
      setStudentToDelete(null);
      
      // Show success notification
      setCenterNotification({
        show: true,
        type: 'success',
        message: 'Student deleted successfully!'
      });
    } catch (error) {
      console.error("Error deleting student via API:", error);
      
      // Fallback to local delete if API fails
      deleteStudent(studentToDelete._id);
      
      // Update local state
      setStudents(prev => prev.filter(s => s._id !== studentToDelete._id));
      setShowDeleteModal(false);
      setStudentToDelete(null);
      
      // Show success notification (fallback worked)
      setCenterNotification({
        show: true,
        type: 'success',
        message: 'Student deleted successfully!'
      });
    }
  }, [studentToDelete, deleteStudent, setStudents]);
  
  const handleCancelDelete = useCallback(() => {
    setShowDeleteModal(false);
    setStudentToDelete(null);
  }, []);
  
  // Handle notification
  const handleNotifyClick = useCallback((student) => {
    setStudentToNotify(student);
    setNotification({ title: '', message: '' });
    setShowNotificationModal(true);
  }, []);
  
  const handleNotificationChange = useCallback((e) => {
    const { name, value } = e.target;
    setNotification(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);
  
  const handleSendNotification = useCallback(async () => {
    if (!studentToNotify || !notification.title || !notification.message) return;
    
    try {
      // Send notification via API
      await apiService.post(`/notifications/student/${studentToNotify._id}`, {
        title: notification.title,
        message: notification.message
      });
      
      // Reset form and close modal
      setNotification({ title: '', message: '' });
      setShowNotificationModal(false);
      setStudentToNotify(null);
      
      // Show success notification
      setCenterNotification({
        show: true,
        type: 'success',
        message: 'Notification sent successfully!'
      });
    } catch (error) {
      console.error("Error sending notification via API:", error);
      
      // Show error notification
      setCenterNotification({
        show: true,
        type: 'error',
        message: 'Failed to send notification. Please try again.'
      });
    }
  }, [studentToNotify, notification]);
  
  const handleCancelNotification = useCallback(() => {
    setShowNotificationModal(false);
    setStudentToNotify(null);
    setNotification({ title: '', message: '' });
  }, []);
  
  // Handle closing the center notification
  const handleCloseNotification = useCallback(() => {
    setCenterNotification(prev => ({ ...prev, show: false }));
  }, []);

  // Memoized pagination controls to prevent unnecessary re-renders
  const PaginationControls = memo(function PaginationControls({ totalItems, itemsPerPage, currentPage, onPageChange }) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    // Generate page numbers array
    const pageNumbers = useMemo(() => {
      const pages = [];
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }, [totalPages]);
    
    // Handle page change
    const handlePageClick = useCallback((pageNumber) => {
      onPageChange(pageNumber);
    }, [onPageChange]);
    
    if (totalPages <= 1) return null;
    
    return (
      <div className="flex justify-center mt-6">
        <nav className="inline-flex items-center rounded-lg overflow-hidden shadow-lg" aria-label="Pagination">
          <button
            onClick={() => handlePageClick(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-white text-blue-600 hover:bg-blue-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="sr-only">Previous</span>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          
          {pageNumbers.map(number => (
            <button
              key={number}
              onClick={() => handlePageClick(number)}
              className={`px-4 py-2 text-sm font-medium ${
                currentPage === number
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-blue-600 hover:bg-blue-50'
              } transition-colors duration-200`}
            >
              {number}
            </button>
          ))}
          
          <button
            onClick={() => handlePageClick(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-white text-blue-600 hover:bg-blue-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="sr-only">Next</span>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </nav>
      </div>
    );
  });
  
  // Memoized handler for pagination
  const handlePageChange = useCallback((pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to top of the page for better UX
    window.scrollTo(0, 0);
  }, []);
  
  // Memoized student table row component to prevent unnecessary re-renders
  const StudentTableRow = memo(function StudentTableRow({ student, onEdit, onDelete, onNotify }) {
    const studentCleared = isFullyCleared(student);
    const clearanceDate = student.clearance_date ? new Date(student.clearance_date).toLocaleDateString() : '-';
    
    return (
      <tr className="hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div>
              <div className="text-sm font-medium text-gray-900">{student.name}</div>
              <div className="text-sm text-gray-500">{student.email}</div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">{student.roll_number}</div>
          <div className="text-sm text-gray-500">{student.program}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          {studentCleared ? (
            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
              <FaCheckCircle className="mr-1 mt-0.5" /> Cleared
            </span>
          ) : (
            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
              <FaExclamationCircle className="mr-1 mt-0.5" /> Pending
            </span>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {clearanceDate}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => onEdit(student._id)}
              className="text-indigo-600 hover:text-indigo-900"
              title="Edit Student"
            >
              <FaEdit className="w-5 h-5" />
            </button>
            <button
              onClick={() => onNotify(student)}
              className="text-blue-600 hover:text-blue-900"
              title="Send Notification"
            >
              <FaBell className="w-5 h-5" />
            </button>
            <button
              onClick={() => onDelete(student)}
              className="text-red-600 hover:text-red-900"
              title="Delete Student"
            >
              <FaTrash className="w-5 h-5" />
            </button>
          </div>
        </td>
      </tr>
    );
  });
  
  // Memoized table content to prevent unnecessary re-renders
  const tableContent = useMemo(() => {
    if (paginatedStudents.length === 0) {
      return (
        <tr>
          <td
            colSpan="5"
            className="px-6 py-4 text-center text-gray-500"
          >
            No students found matching your criteria.
          </td>
        </tr>
      );
    }
    
    return paginatedStudents.map((student) => (
      <StudentTableRow 
        key={student._id}
        student={student}
        onEdit={(id) => router.push(`/admin/students/${id}`)}
        onDelete={handleDeleteClick}
        onNotify={handleNotifyClick}
      />
    ));
  }, [paginatedStudents, router, handleDeleteClick, handleNotifyClick]);

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
                  {tableContent}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Pagination Controls */}
          <PaginationControls
            totalItems={filteredStudents.length}
            itemsPerPage={studentsPerPage}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />

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
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="relative mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <FaTrash className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mt-2">Delete Student</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete {studentToDelete?.name}? This action cannot be undone.
                </p>
              </div>
              <div className="flex justify-center gap-4 mt-3">
                <button
                  onClick={handleCancelDelete}
                  className="px-4 py-2 bg-gray-200 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Notification Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="relative mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                <FaEnvelope className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mt-2 text-center">Send Notification</h3>
              <div className="mt-4 px-2">
                <p className="text-sm text-gray-500 mb-4">
                  Send a notification to {studentToNotify?.name} ({studentToNotify?.roll_number})
                </p>
                
                <div className="mb-4">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Notification Title</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={notification.title}
                    onChange={handleNotificationChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="E.g., Important Update"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={notification.message}
                    onChange={handleNotificationChange}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your message here..."
                  ></textarea>
                </div>
              </div>
              <div className="flex justify-center gap-4 mt-5">
                <button
                  onClick={handleCancelNotification}
                  className="px-4 py-2 bg-gray-200 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendNotification}
                  disabled={!notification.title || !notification.message}
                  className="px-4 py-2 bg-blue-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send Notification
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Center Notification */}
      <CenterNotification
        show={centerNotification.show}
        type={centerNotification.type}
        message={centerNotification.message}
        onClose={handleCloseNotification}
        duration={3000}
      />
    </div>
  );
}
