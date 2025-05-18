"use client";
import Header from "@/app/components/Header";
import Link from "next/link";
import { FaChartLine, FaClipboardCheck, FaFileUpload, FaHome, FaRegBell, FaRegCalendarAlt, FaSignInAlt, FaUserPlus, FaUsers } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { useStudents } from "@/app/context/StudentContext";
import { useState, useEffect } from "react";

export default function AdminDashboard() {
  const router = useRouter(); 
  const { auth, logout } = useAuth();
  const { getAllStudents } = useStudents();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    clearedStudents: 0,
    pendingStudents: 0,
    lastUpdate: new Date().toLocaleString()
  });
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    // Check if user is authenticated and is an admin
    if (!auth.loading) {
      setLoading(false);
      if (!auth.isAuthenticated) {
        router.push("/login");
      } else if (auth.role !== "admin") {
        router.push("/");
      } else {
        // Get statistics from localStorage or calculate them
        const students = getAllStudents();
        const clearedStudents = students.filter(student => 
          Object.values(student.clearance_status).every(status => status === true)
        ).length;
        
        setStats({
          totalStudents: students.length,
          clearedStudents: clearedStudents,
          pendingStudents: students.length - clearedStudents,
          lastUpdate: new Date().toLocaleString()
        });
        
        // Store current time as last update
        localStorage.setItem('lastUpdate', new Date().toLocaleString());
        
        // Load recent activities from localStorage
        try {
          const storedActivities = localStorage.getItem('recentActivities');
          if (storedActivities) {
            setRecentActivities(JSON.parse(storedActivities));
          } else {
            // Default activities if none exist
            const defaultActivities = [
              { type: 'user', message: 'New student added', time: '2 hours ago', icon: 'FaUserPlus', color: 'emerald' },
              { type: 'update', message: 'Clearance status updated', time: 'Yesterday', icon: 'FaUsers', color: 'blue' }
            ];
            setRecentActivities(defaultActivities);
            localStorage.setItem('recentActivities', JSON.stringify(defaultActivities));
          }
        } catch (error) {
          console.error("Error loading recent activities:", error);
        }
      }
    }
  }, [auth, router, getAllStudents]);

  // Function to add a new activity
  const addActivity = (type, message) => {
    const newActivity = {
      type,
      message,
      time: 'Just now',
      icon: type === 'user' ? 'FaUserPlus' : 'FaClipboardCheck',
      color: type === 'user' ? 'emerald' : 'blue'
    };
    
    const updatedActivities = [newActivity, ...recentActivities.slice(0, 4)];
    setRecentActivities(updatedActivities);
    localStorage.setItem('recentActivities', JSON.stringify(updatedActivities));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 border-opacity-75"></div>
          <p className="mt-4 text-blue-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const getActivityIcon = (iconName) => {
    switch(iconName) {
      case 'FaUserPlus': return <FaUserPlus className="w-5 h-5" />;
      case 'FaUsers': return <FaUsers className="w-5 h-5" />;
      case 'FaClipboardCheck': return <FaClipboardCheck className="w-5 h-5" />;
      default: return <FaChartLine className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-50">
      <Header title="Admin Dashboard" auth={auth} logout={logout} />

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Card */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-blue-100">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-blue-800 mb-1">
                Welcome, {auth.user?.name || 'Administrator'}
              </h1>
              <p className="text-blue-600 text-sm">
                Manage student clearances and monitor system status
              </p>
            </div>
            <div className="flex space-x-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <FaRegCalendarAlt className="mr-1" /> {new Date().toLocaleDateString()}
              </span>
            
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-blue-100">
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Students</p>
                  <h3 className="text-3xl font-bold text-blue-800 mt-1">{stats.totalStudents}</h3>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FaUsers className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 text-xs text-blue-500">
                <span className="text-green-500 font-medium">+{Math.floor(stats.totalStudents * 0.1)}</span> from last month
              </div>
            </div>
            <div className="bg-blue-600 h-1"></div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-blue-100">
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Cleared Students</p>
                  <h3 className="text-3xl font-bold text-blue-800 mt-1">{stats.clearedStudents}</h3>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <FaClipboardCheck className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 text-xs text-blue-500">
                <span className="text-green-500 font-medium">{Math.round((stats.clearedStudents / stats.totalStudents) * 100)}%</span> clearance rate
              </div>
            </div>
            <div className="bg-green-600 h-1"></div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-blue-100">
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Pending Clearances</p>
                  <h3 className="text-3xl font-bold text-blue-800 mt-1">{stats.pendingStudents}</h3>
                </div>
                <div className="p-3 bg-amber-100 rounded-lg">
                  <FaChartLine className="h-6 w-6 text-amber-600" />
                </div>
              </div>
              <div className="mt-4 text-xs text-blue-500">
                <span className="text-amber-500 font-medium">{Math.round((stats.pendingStudents / stats.totalStudents) * 100)}%</span> of total students
              </div>
            </div>
            <div className="bg-amber-600 h-1"></div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-blue-100">
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">System Status</p>
                  <h3 className="text-xl font-bold text-blue-800 mt-1">Active</h3>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <div className="h-6 w-6 text-blue-600 flex items-center justify-center">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-xs text-blue-500">
                Last updated: {stats.lastUpdate}
              </div>
            </div>
            <div className="bg-blue-600 h-1"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Action Cards */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/admin/add-student"
              className="bg-white rounded-xl shadow-md p-6 border border-blue-100 hover:shadow-lg transition-all flex flex-col items-center"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4 shadow-md">
                <FaUserPlus className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-base font-semibold text-blue-800">
                Add Student
              </h2>
              <p className="mt-2 text-xs text-blue-500 text-center">
                Add a new student to the system
              </p>
            </Link>

            <Link
              href="/admin/upload-students"
              className="bg-white rounded-xl shadow-md p-6 border border-blue-100 hover:shadow-lg transition-all flex flex-col items-center"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4 shadow-md">
                <FaFileUpload className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-base font-semibold text-blue-800">
                Bulk Upload
              </h2>
              <p className="mt-2 text-xs text-blue-500 text-center">
                Upload multiple students via CSV
              </p>
            </Link>

            <Link
              href="/admin/students"
              className="bg-white rounded-xl shadow-md p-6 border border-blue-100 hover:shadow-lg transition-all flex flex-col items-center"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4 shadow-md">
                <FaUsers className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-base font-semibold text-blue-800">
                Manage Students
              </h2>
              <p className="mt-2 text-xs text-blue-500 text-center">
                View and update clearance status
              </p>
            </Link>
          </div>

          {/* Recent Activity Section */}
          <div className="bg-white shadow-md rounded-xl overflow-hidden border border-blue-100">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white px-5 py-4">
              <h3 className="text-base font-semibold flex items-center">
                <FaClipboardCheck className="mr-2" /> Recent Activity
              </h3>
            </div>
            <div className="p-4 max-h-[150px] overflow-y-auto">
              <div className="space-y-3">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center p-3 rounded-lg bg-blue-50 border border-blue-100">
                    <div className="mr-3 p-2 bg-blue-100 rounded-full text-blue-600">
                      {getActivityIcon(activity.icon)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-800">{activity.message}</p>
                      <p className="text-xs text-blue-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
                
                {recentActivities.length === 0 && (
                  <div className="text-center p-4 text-blue-500 text-sm">
                    No recent activities
                  </div>
                )}
              </div>
            </div>
            <div className="px-4 py-3 bg-blue-50 border-t border-blue-100">
              <button 
                onClick={() => addActivity('update', 'Dashboard refreshed')}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center"
              >
                <FaChartLine className="mr-1 w-3 h-3" /> Refresh Activities
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/"
            className="bg-white text-slate-700 py-2.5 px-5 rounded-lg shadow-sm border border-slate-300 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
          >
            <FaHome className="w-4 h-4" /> Back to Home
          </Link>
          <Link
            href="/login"
            className="bg-blue-600 text-white py-2.5 px-5 rounded-lg shadow-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
          >
            <FaSignInAlt className="w-4 h-4" /> Log Out
          </Link>
        
                
        </div>
      </div>
    </div>
  );
};  
