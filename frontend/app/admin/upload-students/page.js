"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth, logout } from "../../context/AuthContext";
import { useStudents } from "../../context/StudentContext";
import Link from "next/link";
import Header from "@/app/components/Header";
import CenterNotification from "@/app/components/CenterNotification";
import Loader from "@/app/components/Loader";

export default function UploadStudents() {
  const router = useRouter();
  const { auth, logout } = useAuth();
  const { addBulkStudents } = useStudents();
  const [loading, setLoading] = useState(true);
  const [csvData, setCsvData] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  
  // Center notification state
  const [notification, setNotification] = useState({
    show: false,
    type: 'success',
    message: ''
  });

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setCsvData(null);
    setParsedData([]);
    setNotification({
      show: false,
      type: 'success',
      message: ''
    });

    if (file) {
      if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
        setNotification({
          show: true,
          type: 'error',
          message: 'Please upload a CSV file'
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setCsvData(event.target.result);
        parseCSV(event.target.result);
      };
      reader.readAsText(file);
    }
  };

  const parseCSV = (csvText) => {
    try {
      const lines = csvText.split("\n");
      const headers = lines[0].split(",").map((header) => header.trim());

      // Validate required headers
      const requiredHeaders = ["name", "roll_number", "email"];
      const missingHeaders = requiredHeaders.filter(
        (h) => !headers.includes(h)
      );

      if (missingHeaders.length > 0) {
        setNotification({
          show: true,
          type: 'error',
          message: `CSV is missing required headers: ${missingHeaders.join(", ")}`
        });
        return;
      }

      const results = [];
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === "") continue;

        const currentLine = lines[i].split(",").map((field) => field.trim());
        if (currentLine.length !== headers.length) {
          setNotification({
            show: true,
            type: 'error',
            message: `Line ${i + 1} has an incorrect number of fields`
          });
          return;
        }

        const entry = {};
        headers.forEach((header, index) => {
          entry[header] = currentLine[index];
        });

        // Set default clearance status
        entry.clearance_status = {
          dispensary: false,
          hostel: false,
          due: false,
          library: false,
          academic_department: false,
          alumni: false,
        };

        // Add user_id as email
        entry.user_id = entry.email;

        results.push(entry);
      }

      setParsedData(results);
      if (results.length > 0) {
        setNotification({
          show: true,
          type: 'success',
          message: `Successfully parsed ${results.length} student records. Review and submit to add to system.`
        });
      } else {
        setNotification({
          show: true,
          type: 'error',
          message: "No valid student records found in CSV"
        });
      }
    } catch (err) {
      console.error(err);
      setNotification({
        show: true,
        type: 'error',
        message: "Error parsing CSV file. Please check format and try again."
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (parsedData.length === 0) {
      setNotification({
        show: true,
        type: 'error',
        message: "No data to upload"
      });
      return;
    }

    try {
      setNotification({
        show: true,
        type: 'info',
        message: "Processing... Please wait."
      });
      
      const result = await addBulkStudents(parsedData);
      
      if (result.success) {
        setNotification({
          show: true,
          type: 'success',
          message: `Successfully added ${result.added} students to the system! ${result.skipped > 0 ? `(${result.skipped} duplicate students were skipped)` : ''}`
        });
        setParsedData([]);
        setCsvData(null);
        
        // Redirect to students page after successful upload
        setTimeout(() => {
          router.push("/admin/students");
        }, 2000);
      } else {
        setNotification({
          show: true,
          type: 'error',
          message: result.message || "Failed to add students to the system"
        });
      }
    } catch (error) {
      console.error("Error uploading students:", error);
      setNotification({
        show: true,
        type: 'error',
        message: "An error occurred while uploading students"
      });
    }
  };

  if (loading) {
    return <Loader message="Loading Upload Interface..." />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Header */}
      <Header title={"Upload Students"} auth={auth} logout={logout} />
      
      {/* Center Notification */}
      <CenterNotification
        show={notification.show}
        type={notification.type}
        message={notification.message}
        onClose={() => setNotification(prev => ({ ...prev, show: false }))}
        duration={2000}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          <div className="px-6 py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Upload Students in Bulk
            </h2>
            <p className="text-gray-600 mb-8">
              Upload a CSV file containing student information. The CSV must include columns for name, roll number, and email.
            </p>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="flex items-center justify-center w-full">
                <label className="w-full flex flex-col items-center px-4 py-6 bg-blue-50 text-blue-500 rounded-lg border-2 border-blue-300 border-dashed cursor-pointer hover:bg-blue-100 transition duration-300 ease-in-out">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                  </svg>
                  <span className="mt-2 text-base leading-normal">Select a CSV file</span>
                  <input type="file" className="hidden" accept=".csv" onChange={handleFileChange} />
                </label>
              </div>

              {parsedData.length > 0 && (
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Preview ({parsedData.length} students)
                    </h3>
                  </div>
                  <div className="overflow-x-auto max-h-96">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll Number</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {parsedData.slice(0, 10).map((student, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.roll_number}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.email}</td>
                          </tr>
                        ))}
                        {parsedData.length > 10 && (
                          <tr>
                            <td colSpan="3" className="px-6 py-4 text-sm text-gray-500 text-center">
                              ...and {parsedData.length - 10} more
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <button
                      type="submit"
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 ease-in-out"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                      </svg>
                      Upload Students
                    </button>
                  </div>
                </div>
              )}
            </form>

            <div className="mt-8 bg-gray-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">CSV Format Guide</h4>
              <p className="text-sm text-gray-600 mb-4">
                Your CSV file should have the following headers:
              </p>
              <div className="bg-white p-4 rounded-md shadow-sm overflow-x-auto">
                <code className="text-sm text-blue-600">name,roll_number,email</code>
              </div>
              <p className="text-sm text-gray-600 mt-4 mb-2">Example:</p>
              <div className="bg-white p-4 rounded-md shadow-sm overflow-x-auto">
                <code className="text-sm text-green-600">
                  Ahmad Raza , 21-SE-32 , 21-se-32@students.uettaxila.edu.pk  <br />
                  Ali Raza ,   21-SE-33 , 21-se-33@students.uettaxila.edu.pk

                </code>
              </div>
            </div>
          </div>
        </div>
        
        {/* Navigation Links */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Link
            href="/admin/dashboard"
            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 ease-in-out"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path>
            </svg>
            Back to Dashboard
          </Link>
          <Link
            href="/admin/students"
            className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 ease-in-out"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
            </svg>
            View All Students
          </Link>
        </div>
      </div>
    </div>
  );
}
