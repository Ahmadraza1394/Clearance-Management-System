"use client";
import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { useStudents } from "@/app/context/StudentContext";
import Link from "next/link";
import Header from "@/app/components/Header";
import { FaChartLine, FaClipboardCheck, FaFileUpload, FaHome, FaRegBell, FaRegCalendarAlt, FaSignInAlt, FaUserPlus, FaUsers, FaIdCard, FaCheckCircle, FaUserCog } from "react-icons/fa";
import apiService from "@/app/utils/api";

// Memoized component for activity icons to prevent unnecessary re-renders
const ActivityIcon = memo(function ActivityIcon({ iconName }) {
  switch(iconName) {
    case 'FaUserPlus': return <FaUserPlus className="w-5 h-5" />;
    case 'FaUsers': return <FaUsers className="w-5 h-5" />;
    case 'FaClipboardCheck': return <FaClipboardCheck className="w-5 h-5" />;
    default: return <FaChartLine className="w-5 h-5" />;
  }
});

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

  // Memoized function to calculate stats from student data
  const calculateStats = useCallback((students) => {
    const clearedStudents = students.filter(student => 
      Object.values(student.clearance_status).every(status => status === true)
    ).length;
    
    return {
      totalStudents: students.length,
      clearedStudents,
      pendingStudents: students.length - clearedStudents,
      lastUpdate: new Date().toLocaleString()
    };
  }, []);

  // Memoized function to fetch dashboard data
  const fetchDashboardStats = useCallback(async () => {
    try {
      const data = await apiService.get('/admin/dashboard');
      setStats({
        totalStudents: data.totalStudents,
        clearedStudents: data.clearedStudents,
        pendingStudents: data.pendingStudents,
        lastUpdate: new Date(data.lastUpdate).toLocaleString()
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      const students = getAllStudents();
      setStats(calculateStats(students));
    } finally {
      setLoading(false);
    }
  }, [getAllStudents, calculateStats]);

  // Memoized function to load activities
  const loadActivities = useCallback(() => {
    try {
      const storedActivities = localStorage.getItem('recentActivities');
      if (storedActivities) {
        setRecentActivities(JSON.parse(storedActivities));
      } else {
        const defaultActivities = [
          { type: 'user', message: 'New student added', time: '2 hours ago', icon: 'FaUserPlus', color: 'teal' },
          { type: 'update', message: 'Clearance status updated', time: 'Yesterday', icon: 'FaUsers', color: 'indigo' }
        ];
        setRecentActivities(defaultActivities);
        localStorage.setItem('recentActivities', JSON.stringify(defaultActivities));
      }
    } catch (error) {
      console.error("Error loading activities:", error);
    }
  }, []);

  useEffect(() => {
    if (!auth.loading) {
      if (!auth.isAuthenticated) {
        router.push("/login");
        return;
      } else if (auth.role !== "admin") {
        router.push("/");
        return;
      }
      
      // Fetch data and load activities in parallel
      fetchDashboardStats();
      loadActivities();
      
      // Update last update timestamp
      localStorage.setItem('lastUpdate', new Date().toLocaleString());
    }
  }, [auth, router, fetchDashboardStats, loadActivities]);

  // Memoized activity list content to prevent unnecessary re-renders
  const activityListContent = useMemo(() => {
    if (recentActivities.length === 0) {
      return <p className="text-center text-gray-500 text-sm">No recent activities</p>;
    }
    
    return recentActivities.map((activity, index) => (
      <div key={index} className="flex items-start gap-3">
        <div className={`p-2 rounded-full bg-${activity.color}-100`}>
          <ActivityIcon iconName={activity.icon} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-800">{activity.message}</p>
          <p className="text-xs text-gray-500">{activity.time}</p>
        </div>
      </div>
    ));
  }, [recentActivities]);

  // Memoized function to add new activity
  const addActivity = useCallback((type, message) => {
    const newActivity = {
      type,
      message,
      time: 'Just now',
      icon: type === 'user' ? 'FaUserPlus' : 'FaClipboardCheck',
      color: type === 'user' ? 'teal' : 'indigo'
    };
    
    setRecentActivities(prevActivities => {
      const updatedActivities = [newActivity, ...prevActivities.slice(0, 4)];
      localStorage.setItem('recentActivities', JSON.stringify(updatedActivities));
      return updatedActivities;
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-100">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600 border-opacity-75"></div>
          <p className="mt-4 text-indigo-600 font-medium">Loading your dashboard...</p>
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
    <div className="min-h-screen bg-gray-100">
      <Header title="Admin Dashboard" auth={auth} logout={logout} />

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-1">
                Welcome, {auth.user?.name || 'Administrator'}
              </h1>
              <p className="text-gray-600 text-sm">
                Manage student clearances and system administration
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
                <FaRegCalendarAlt className="mr-1" /> {new Date().toLocaleDateString()}
              </span>
              <Link href="/admin/students" className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 hover:bg-indigo-200 transition-colors">
                <FaUsers className="mr-1" /> Manage Students
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <h3 className="text-3xl font-bold text-gray-800 mt-1">{stats.totalStudents}</h3>
                </div>
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <FaUsers className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
              <div className="mt-4 text-xs text-gray-500">
                <span className="text-green-500 font-medium">+{Math.floor(stats.totalStudents * 0.1)}</span> from last month
              </div>
            </div>
            <div className="bg-indigo-600 h-1"></div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cleared Students</p>
                  <h3 className="text-3xl font-bold text-gray-800 mt-1">{stats.clearedStudents}</h3>
                </div>
                <div className="p-3 bg-teal-100 rounded-lg">
                  <FaClipboardCheck className="h-6 w-6 text-teal-600" />
                </div>
              </div>
              <div className="mt-4 text-xs text-gray-500">
                <span className="text-teal-500 font-medium">{Math.round((stats.clearedStudents / stats.totalStudents) * 100)}%</span> clearance rate
              </div>
            </div>
            <div className="bg-teal-600 h-1"></div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Clearances</p>
                  <h3 className="text-3xl font-bold text-gray-800 mt-1">{stats.pendingStudents}</h3>
                </div>
                <div className="p-3 bg-amber-100 rounded-lg">
                  <FaChartLine className="h-6 w-6 text-amber-600" />
                </div>
              </div>
              <div className="mt-4 text-xs text-gray-500">
                <span className="text-amber-500 font-medium">{Math.round((stats.pendingStudents / stats.totalStudents) * 100)}%</span> of total students
              </div>
            </div>
            <div className="bg-amber-600 h-1"></div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">System Status</p>
                  <h3 className="text-xl font-bold text-gray-800 mt-1">Active</h3>
                </div>
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <div className="h-6 w-6 text-indigo-600 flex items-center justify-center">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-xs text-gray-500">
                Last updated: {stats.lastUpdate}
              </div>
            </div>
            <div className="bg-indigo-600 h-1"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <Link href="/admin/students" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all flex flex-col items-center">
              <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center mb-4 shadow-md">
                <FaUsers className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-base font-semibold text-gray-800">Manage Students</h2>
              <p className="mt-2 text-xs text-gray-500 text-center">View and update clearance status</p>
            </Link>
            <Link href="/admin/add-student" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all flex flex-col items-center">
              <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center mb-4 shadow-md">
                <FaUserPlus className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-base font-semibold text-gray-800">Add Student</h2>
              <p className="mt-2 text-xs text-gray-500 text-center">Add a new student to the system</p>
            </Link>
            <Link href="/admin/upload-students" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all flex flex-col items-center">
              <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center mb-4 shadow-md">
                <FaFileUpload className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-base font-semibold text-gray-800">Bulk Upload</h2>
              <p className="mt-2 text-xs text-gray-500 text-center">Upload multiple students via CSV</p>
            </Link>
            <Link href="/admin/verify-certificate" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all flex flex-col items-center">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mb-4 shadow-md">
                <FaCheckCircle className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-base font-semibold text-gray-800">Verify Certificate</h2>
              <p className="mt-2 text-xs text-gray-500 text-center">Verify student clearance certificates</p>
            </Link>
            <Link href="/admin/manage-admins" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all flex flex-col items-center">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mb-4 shadow-md">
                <FaUserCog className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-base font-semibold text-gray-800">Manage Admins</h2>
              <p className="mt-2 text-xs text-gray-500 text-center">Add or remove system administrators</p>
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md flex flex-col h-full">
            <div className="bg-indigo-600 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <FaClipboardCheck className="w-5 h-5" /> Recent Activity
              </h3>
              <button
                onClick={() => addActivity('update', 'Dashboard refreshed')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold transition text-white"
                title="Refresh Activities"
              >
                <FaChartLine className="w-4 h-4" /> Refresh
              </button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto max-h-52 min-h-[100px]">
              <div className="space-y-2">
                {activityListContent}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
