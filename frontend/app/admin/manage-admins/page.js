"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import Link from "next/link";
import Header from "@/app/components/Header";
import { FaEdit, FaTrash, FaUserPlus, FaArrowLeft, FaEye, FaEyeSlash } from "react-icons/fa";
import apiService from "@/app/utils/api";
import Loader from "@/app/components/Loader";

export default function ManageAdmins() {
  const router = useRouter();
  const { auth, logout } = useAuth();
  
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
      
      // Fetch admins
      fetchAdmins();
    }
  }, [auth, router]);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const data = await apiService.get('/admins');
      setAdmins(data);
    } catch (error) {
      console.error("Error fetching admins:", error);
      setError("Failed to load admins. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAdmin(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setFormError('');
    
    // Validate form
    if (!newAdmin.name || !newAdmin.email || !newAdmin.password) {
      setFormError('All fields are required');
      return;
    }
    
    try {
      const response = await apiService.post('/admins', newAdmin);
      
      // Add new admin to the list
      setAdmins(prev => [...prev, response]);
      
      // Reset form
      setNewAdmin({
        name: '',
        email: '',
        password: ''
      });
      
      // Hide form
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding admin:", error);
      setFormError(error.response?.data?.message || "Failed to add admin");
    }
  };

  const handleDeleteAdmin = async (id) => {
    if (!window.confirm("Are you sure you want to delete this admin?")) {
      return;
    }
    
    try {
      await apiService.delete(`/admins/${id}`);
      
      // Remove admin from list
      setAdmins(prev => prev.filter(admin => admin._id !== id));
    } catch (error) {
      console.error("Error deleting admin:", error);
      alert("Failed to delete admin. Please try again.");
    }
  };

  if (loading) {
    return (
      <Loader message="Loading Admins..." />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-50">
      {/* Navigation Header */}
      <Header title={"Manage Administrators"} auth={auth} logout={logout} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8 bg-gradient-to-r from-blue-600 to-indigo-700">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <h1 className="text-3xl font-bold text-white mb-4 md:mb-0">
                Administrator Management
              </h1>
              <div className="flex space-x-4">
                <Link
                  href="/admin/dashboard"
                  className="inline-flex items-center px-5 py-2.5 rounded-lg text-sm font-semibold text-blue-700 bg-white hover:bg-blue-50 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  <FaArrowLeft className="mr-2" />
                  Back to Dashboard
                </Link>
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="inline-flex items-center px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  <FaUserPlus className="mr-2" />
                  {showAddForm ? "Cancel" : "Add New Admin"}
                </button>
              </div>
            </div>
          </div>

          {/* Add Admin Form */}
          {showAddForm && (
            <div className="p-8 border-b border-gray-200 bg-blue-50">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Administrator</h2>
              <form onSubmit={handleAddAdmin} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={newAdmin.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={newAdmin.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                      placeholder="admin@uet.edu.pk"
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        value={newAdmin.password}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10 transition-all duration-300"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 transition-colors duration-300"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                </div>
                
                {formError && (
                  <div className="text-sm text-red-600 bg-red-100 border border-red-400 rounded-lg p-3">
                    {formError}
                  </div>
                )}
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300"
                  >
                    <FaUserPlus className="mr-2" />
                    Add Administrator
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Admin List */}
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Current Administrators</h2>
            
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            {admins.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No administrators</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new administrator.</p>
              </div>
            ) : (
              <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Login
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {admins.map((admin) => (
                      <tr key={admin._id} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{admin.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{admin.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {new Date(admin.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {admin.last_login ? new Date(admin.last_login).toLocaleDateString() : 'Never'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleDeleteAdmin(admin._id)}
                            className="text-red-600 hover:text-red-900 transition-colors duration-200"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
