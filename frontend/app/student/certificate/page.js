"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth, logout } from "../../context/AuthContext";
import { useStudents } from "../../context/StudentContext";
import Link from "next/link";
import Header from "@/app/components/Header";

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
      <div className="min-h-screen flex justify-center items-center bg-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Header */}
      <Header title={"Clearance Certificate"} auth={auth} logout={logout} />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">
              Clearance Certificate
            </h1>
            <div>
              <button
                onClick={printCertificate}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  />
                </svg>
                Print Certificate
              </button>
            </div>
          </div>

          {/* Certificate */}
          <div
            ref={certificateRef}
            className="bg-white p-8 shadow-lg border-8 border-blue-200 rounded-lg"
          >
            <div className="text-center mb-8">
              <div className="w-24 h-24  rounded-full flex items-center justify-center mx-auto mb-4">
                <img
                  src="/logo.jpg"
                  alt="UET Taxila Logo"
                  className="mx-auto h-20 w-20 object-contain"
                />
              </div>
              <h2 className="text-3xl font-bold text-blue-800">
                UNIVERSITY OF ENGINEERING AND TECHNOLOGY
              </h2>
              <p className="text-xl text-gray-600">TAXILA, PAKISTAN</p>
            </div>

            <div className="text-center mb-10">
              <h1 className="text-4xl font-serif font-bold text-gray-800 mb-4">
                CLEARANCE CERTIFICATE
              </h1>
              <div className="w-40 h-1 bg-blue-700 mx-auto"></div>
            </div>

            <div className="mb-8 text-gray-700 text-center">
              <p className="text-lg mb-2">This is to certify that</p>
              <p className="text-2xl font-bold text-blue-900 mb-2">
                {student?.name}
              </p>
              <p className="text-lg mb-2">bearing Roll Number</p>
              <p className="text-2xl font-bold text-blue-900 mb-2">
                {student?.roll_number}
              </p>
              <p className="text-lg">
                has been cleared from all departments of the university.
              </p>
            </div>

            <div className="mb-12 text-gray-700">
              <p className="text-lg">
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
                  {student?.clearance_date
                    ? new Date(student.clearance_date).toLocaleDateString()
                    : new Date().toLocaleDateString()}
                </p>
              </div>
              <div className="text-center">
                <div className="border-b-2 border-black w-40 mb-1"></div>
                <p className="text-sm">Registrar</p>
                <p className="text-sm">UET Taxila</p>
              </div>
            </div>

            <div className="mt-16 flex justify-center">
              <div className="text-center border-2 border-gray-300 rounded-lg p-2 w-64">
                <p className="text-xs text-gray-500">OFFICIAL SEAL</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <Link
              href="/student/dashboard"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
