"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth, logout } from "../../context/AuthContext";
import { useStudents } from "../../context/StudentContext";
import Link from "next/link";
import Header from "@/app/components/Header";
import { FaDownload, FaArrowLeft } from "react-icons/fa";
import Image from "next/image";

export default function Certificate() {
  const router = useRouter();
  const { auth } = useAuth();
  const { getStudentById } = useStudents();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const certificateRef = useRef(null);
  
  // Define isFullyCleared function with useCallback to prevent recreation on each render
  const isFullyCleared = useCallback((studentData) => {
    if (!studentData || !studentData.clearance_status) return false;
    return Object.values(studentData.clearance_status).every(status => status === true);
  }, []);

  // Memoize the studentId to prevent unnecessary re-renders
  const studentId = useMemo(() => {
    return auth.user?.id;
  }, [auth.user]);

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
      
      // Try to get from localStorage cache first
      try {
        const cachedData = localStorage.getItem(`student_${studentId}`);
        if (cachedData) {
          const parsedData = JSON.parse(cachedData);
          const studentData = parsedData.data;
          
          if (studentData) {
            setStudent(studentData);
            
            // Check if student is fully cleared
            if (!isFullyCleared(studentData)) {
              // If not cleared, redirect back to dashboard
              router.push("/student/dashboard");
              return;
            }
            
            setLoading(false);
            return;
          }
        }
      } catch (error) {
        console.error('Error loading cached student data:', error);
      }
      
      // Fallback to context if cache is not available
      const studentData = getStudentById(studentId);
      if (studentData) {
        setStudent(studentData);
        
        // Check if student is fully cleared
        if (!isFullyCleared(studentData)) {
          // If not cleared, redirect back to dashboard
          router.push("/student/dashboard");
          return;
        }
      } else {
        router.push("/student/dashboard");
        return;
      }
      setLoading(false);
    }
  }, [auth, router, getStudentById, isFullyCleared, studentId]);

  // Use useCallback to prevent recreation of this function on each render
  const printCertificate = useCallback(() => {
    if (!certificateRef.current) return;
    
    const printContent = certificateRef.current.innerHTML;
    const originalContent = document.body.innerHTML;

    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  }, [certificateRef]);

  // Memoize the loading component to prevent unnecessary re-renders
  const loadingComponent = useMemo(() => (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-r from-blue-50 to-indigo-50">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 border-opacity-75"></div>
        <p className="mt-4 text-blue-600 font-medium">Preparing your certificate...</p>
      </div>
    </div>
  ), []);
  
  if (loading) {
    return loadingComponent;
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-50">
      {/* Navigation Header */}
      <Header title={"Clearance Certificate"} auth={auth} logout={logout} />

      {/* Main Content */}
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-white">
                Clearance Certificate
              </h1>
              <div className="flex space-x-3">
                <Link
                  href="/student/dashboard"
                  className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-blue-700 bg-white hover:bg-blue-50 transition-colors duration-200 shadow-sm"
                >
                  <FaArrowLeft className="mr-2" />
                  Back to Dashboard
                </Link>
                <button
                  onClick={printCertificate}
                  className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 transition-colors duration-200 shadow-sm"
                >
                  <FaDownload className="mr-2" />
                  Print Certificate
                </button>
              </div>
            </div>
          </div>

          {/* Certificate */}
          <div ref={certificateRef} className="p-8">
            <div className="certificate-container bg-gradient-to-br from-white to-blue-50 p-6 border-4 border-blue-200 rounded-2xl shadow-2xl">
              <div className="text-center mb-4">
                <div className="w-20 h-20 mx-auto mb-2 relative">
                  <Image src="/logo.jpg" alt="UET Taxila Logo" className="object-contain rounded-full shadow-md" layout="fill" />
                </div>
                <h2 className="text-2xl font-bold text-blue-900 tracking-wide">
                  UNIVERSITY OF ENGINEERING AND TECHNOLOGY
                </h2>
                <p className="text-lg text-gray-600 mt-1 font-light">TAXILA, PAKISTAN</p>
              </div>

              <div className="text-center mb-4">
                <h1 className="text-3xl font-serif font-bold text-gray-800 mb-2">CLEARANCE CERTIFICATE</h1>
                <div className="flex items-center justify-center">
                  <div className="w-12 h-1 bg-gradient-to-r from-blue-300 to-blue-600 rounded-full"></div>
                  <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 mx-2 rounded-full"></div>
                  <div className="w-12 h-1 bg-gradient-to-r from-indigo-600 to-blue-300 rounded-full"></div>
                </div>
              </div>

              <div className="mb-4 text-gray-700 text-center">
                <p className="text-base mb-1 font-light">This is to certify that</p>
                <p className="text-2xl font-bold text-blue-900 mb-1">
                  {student?.name}
                </p>
                <p className="text-base mb-1 font-light">bearing Roll Number</p>
                <p className="text-xl font-bold text-blue-900 mb-1">{student?.roll_number}</p>
                <p className="text-base font-light">has been cleared from all departments of the university.</p>
              </div>

              <div className="mb-4 text-gray-700 bg-blue-50 p-4 rounded-xl border-l-8 border-blue-500 shadow-inner">
                <p className="text-sm leading-relaxed italic">
                  The student has fulfilled all necessary requirements and has no outstanding dues or obligations to the university. 
                  This certificate is issued for the purpose of graduation and future references.
                </p>
              </div>

              <div className="flex justify-between items-end mb-4">
                <p className="text-sm text-gray-600">
                  Date Issued: <span className="font-semibold">
                    {student?.clearance_date ? new Date(student.clearance_date).toLocaleDateString('en-US', {
                      day: 'numeric', month: 'long', year: 'numeric'
                    }) : new Date().toLocaleDateString('en-US', {day: 'numeric', month: 'long', year: 'numeric'})}
                  </span>
                </p>
                <div className="text-center border-4 bg-green-200 border-green-400 rounded-full p-2 w-28 h-28 flex flex-col items-center justify-center bg-gradient-to-br from-green-100 to-green-200 shadow-xl">
                  <p className="text-lg font-extrabold text-green-600 uppercase tracking-wider">Cleared</p>
                </div>
              </div>

              <div className="text-center text-xs text-gray-500">
                <p>This is an official certificate. No physical signature is required for its validity.</p>
                <p>Student Certificate ID: {student?.user_id}</p>
              </div>
            </div>
          </div>
          <style jsx global>{`
            @media print {
              @page {
                size: A4;
                margin: 0;
              }
              body {
                margin: 1cm;
              }
              .certificate-container {
                page-break-inside: avoid;
                max-height: 100vh;
                overflow: hidden;
              }
              #__next {
                display: none;
              }
              .certificate-container {
                display: block !important;
              }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
}
