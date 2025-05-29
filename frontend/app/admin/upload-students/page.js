"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth, logout } from "../../context/AuthContext";
import { useStudents } from "../../context/StudentContext";
import Link from "next/link";
import Header from "@/app/components/Header";
import CenterNotification from "@/app/components/CenterNotification";

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
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
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
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Upload Students in Bulk
              </h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>
                  Upload a CSV file containing student information. The CSV must
                  include columns for name, roll_number, and email.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-5">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center px-4 py-6 bg-white text-blue-500 rounded-lg shadow-lg tracking-wide uppercase border border-blue-500 cursor-pointer hover:bg-blue-500 hover:text-white">
                    <svg
                      className="w-8 h-8"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4-4-4 4h3v3h2v-3z" />
                    </svg>
                    <span className="mt-2 text-base leading-normal">
                      Select a CSV file
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".csv"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>

                {parsedData.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-md font-medium text-gray-900 mb-2">
                      Preview ({parsedData.length} students)
                    </h4>
                    <div className="overflow-x-auto max-h-80">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Name
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
                              Email
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {parsedData.slice(0, 10).map((student, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {student.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {student.roll_number}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {student.email}
                              </td>
                            </tr>
                          ))}
                          {parsedData.length > 10 && (
                            <tr>
                              <td
                                colSpan="3"
                                className="px-6 py-4 text-sm text-gray-500 text-center"
                              >
                                ...and {parsedData.length - 10} more
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-5">
                      <button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Upload Students
                      </button>
                    </div>
                  </div>
                )}
              </form>

              <div className="mt-6 bg-gray-50 p-4 rounded-md">
                <h4 className="text-sm font-medium text-gray-900">
                  CSV Format
                </h4>
                <p className="text-xs text-gray-600 mt-1">
                  Your CSV file should have the following headers:
                </p>
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                  name,roll_number,email
                </pre>
                <p className="text-xs text-gray-600 mt-2">Example:</p>
                <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                  John Doe,BCS-F19-M-123,john.doe@example.com Jane
                  Smith,BCS-F19-F-124,jane.smith@example.com
                </pre>
              </div>
            </div>
          </div>
          {/* Back to Dashboard Link */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <Link
              href="/admin/dashboard"
              className="rounded-lg bg-gray-200 px-4 py-2 text-gray-700 font-semibold shadow-md hover:bg-gray-300 transition-colors duration-200 flex items-center justify-center"
            >
              Back to Dashboard
            </Link>
            <Link
              href="/admin/students"
              className="rounded-lg bg-blue-600 px-4 py-2 text-white font-semibold shadow-md hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
            >
              View All Students
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
