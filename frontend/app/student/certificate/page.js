"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth, logout } from "../../context/AuthContext";
import { useStudents } from "../../context/StudentContext";
import Link from "next/link";
import Header from "@/app/components/Header";
import { FaDownload, FaArrowLeft } from "react-icons/fa";

export default function Certificate() {
  const router = useRouter();
  const { auth } = useAuth();
  const { getStudentById, isFullyCleared } = useStudents();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const certificateRef = useRef(null);

  useEffect(() => {
    // Check if user is authenticated and is a student
    if (!auth.loading) {
      if (!auth.isAuthenticated) {
        router.push("/login");
      } else if (auth.role !== "student") {
        router.push("/");
      } else {
        // Get student data
        const studentData = getStudentById(auth.user.id);
        if (studentData) {
          setStudent(studentData);

          // Check if student is fully cleared
          if (!isFullyCleared(studentData._id)) {
            // If not cleared, redirect back to dashboard
            router.push("/student/dashboard");
          }
        } else {
          router.push("/student/dashboard");
        }
        setLoading(false);
      }
    }
  }, [auth, router, getStudentById, isFullyCleared]);

  const printCertificate = () => {
    const printContent = certificateRef.current.innerHTML;
    const originalContent = document.body.innerHTML;

    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 border-opacity-75"></div>
          <p className="mt-4 text-blue-600 font-medium">Preparing your certificate...</p>
        </div>
      </div>
    );
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
            <div className="certificate-container bg-white p-10 border-8 border-double border-blue-100 rounded-lg shadow-inner">
              <div className="text-center mb-8">
                <div className="w-28 h-28 mx-auto mb-4">
                  <img
                    src="/logo.jpg"
                    alt="UET Taxila Logo"
                    className="h-full w-full object-contain"
                  />
                </div>
                <h2 className="text-3xl font-bold text-blue-800 tracking-wide">
                  UNIVERSITY OF ENGINEERING AND TECHNOLOGY
                </h2>
                <p className="text-xl text-gray-600 mt-1">TAXILA, PAKISTAN</p>
              </div>

              <div className="text-center mb-12">
                <h1 className="text-4xl font-serif font-bold text-gray-800 mb-4">
                  CLEARANCE CERTIFICATE
                </h1>
                <div className="flex items-center justify-center">
                  <div className="w-16 h-1 bg-blue-200"></div>
                  <div className="w-32 h-1 bg-blue-700 mx-2"></div>
                  <div className="w-16 h-1 bg-blue-200"></div>
                </div>
              </div>

              <div className="mb-10 text-gray-700 text-center">
                <p className="text-lg mb-3">This is to certify that</p>
                <p className="text-3xl font-bold text-blue-900 mb-3">
                  {student?.name}
                </p>
                <p className="text-lg mb-3">bearing Roll Number</p>
                <p className="text-2xl font-bold text-blue-900 mb-3">
                  {student?.roll_number}
                </p>
                <p className="text-lg">
                  has been cleared from all departments of the university.
                </p>
              </div>

              <div className="mb-16 text-gray-700 bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
                <p className="text-lg leading-relaxed">
                  The student has fulfilled all necessary requirements and has no
                  outstanding dues or obligations to the university. This
                  certificate is issued for the purpose of graduation and future
                  references.
                </p>
              </div>

              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm text-gray-600">
                    Date Issued:{" "}
                    <span className="font-semibold">
                      {student?.clearance_date
                        ? new Date(student.clearance_date).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })
                        : new Date().toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                    </span>
                  </p>
                </div>
                <div className="text-center">
                  <div className="border-b-2 border-black w-48 mb-2"></div>
                  <p className="text-sm font-semibold">Registrar</p>
                  <p className="text-sm">UET Taxila</p>
                </div>
              </div>

              <div className="mt-16 flex justify-center">
                <div className="text-center border-2 border-gray-300 rounded-full p-6 w-32 h-32 flex items-center justify-center">
                  <p className="text-xs text-gray-500">OFFICIAL SEAL</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
