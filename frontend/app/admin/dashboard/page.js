"use client";
import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { useStudents } from "@/app/context/StudentContext";
import Link from "next/link";
import Header from "@/app/components/Header";
import { FaChartLine, FaClipboardCheck, FaFileUpload, FaHome, FaRegBell, FaRegCalendarAlt, FaSignInAlt, FaUserPlus, FaUsers, FaIdCard, FaCheckCircle, FaUserCog } from "react-icons/fa";
import apiService from "@/app/utils/api";
import Loader from "@/app/components/Loader";

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
      return <p className="text-center text-gray-100 text-sm">No recent activities</p>;
    }
    
    return recentActivities.map((activity, index) => (
      <div key={index} className="flex items-start gap-3">
        <div className={`p-2 rounded-full bg-${activity.color}-100`}>
          <ActivityIcon iconName={activity.icon} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-300">{activity.message}</p>
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
      <Loader message="Loading Dashboard Data..." />
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

      <div className="max-w-7xl mx-auto py-8  px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-indigo-800 to-blue-900 py-16 rounded-lg shadow-lg p-8 mb-10">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h1 className="text-3xl font-extrabold text-white mb-2">
                Welcome, {auth.user?.name || 'Administrator'}
              </h1>
              <p className="text-indigo-100 text-lg">
                Manage student clearances and system administration
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-white text-indigo-900 shadow-sm">
                <FaRegCalendarAlt className="mr-2" /> {new Date().toLocaleDateString()}
              </span>
              <Link href="/admin/students" className="inline-flex items-center px-6 py-3 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-900 hover:bg-indigo-200 transition-colors duration-300 ease-in-out shadow-sm">
                <FaUsers className="mr-2" /> Manage Students
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-indigo-100">Total Students</p>
                  <h3 className="text-4xl font-bold text-white mt-2">{stats.totalStudents}</h3>
                </div>
                <div className="p-3 bg-white bg-opacity-30 rounded-lg">
                  <FaUsers className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="mt-4 text-sm text-indigo-100">
                <span className="text-green-300 font-medium">↑ {Math.floor(stats.totalStudents * 0.1)}</span> from last month
              </div>
            </div>
            <div className="h-1 bg-indigo-400"></div>
          </div>
          
          <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-teal-100">Cleared Students</p>
                  <h3 className="text-4xl font-bold text-white mt-2">{stats.clearedStudents}</h3>
                </div>
                <div className="p-3 bg-white bg-opacity-30 rounded-lg">
                  <FaClipboardCheck className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="mt-4 text-sm text-teal-100">
                <span className="text-green-300 font-medium">{Math.round((stats.clearedStudents / stats.totalStudents) * 100)}%</span> clearance rate
              </div>
            </div>
            <div className="h-1 bg-teal-400"></div>
          </div>
          
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-100">Pending Clearances</p>
                  <h3 className="text-4xl font-bold text-white mt-2">{stats.pendingStudents}</h3>
                </div>
                <div className="p-3 bg-white bg-opacity-30 rounded-lg">
                  <FaChartLine className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="mt-4 text-sm text-amber-100">
                <span className="text-red-300 font-medium">{Math.round((stats.pendingStudents / stats.totalStudents) * 100)}%</span> of total students
              </div>
            </div>
            <div className="h-1 bg-amber-400"></div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-100">System Status</p>
                  <h3 className="text-2xl font-bold text-white mt-2">Active</h3>
                </div>
                <div className="p-3 bg-white bg-opacity-30 rounded-lg">
                  <div className="h-8 w-8 text-white flex items-center justify-center">
                    <span className="relative flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-1 text-sm text-purple-100">
                Last updated: {stats.lastUpdate}
              </div>
            </div>
            <div className="h-1 bg-purple-400"></div>
          </div>
        </div>
        <h2 className="text-4xl font-extrabold text- mb-8 mt-16">
  <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-gradient-x">
    Administrative Actions
  </span>
</h2>
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-8 mb-12">

          
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {[
              { href: "/admin/students", icon: FaUsers, title: "Manage Students", desc: "View and update clearance status", color: "from-blue-500 to-blue-600" },
              { href: "/admin/add-student", icon: FaUserPlus, title: "Add Student", desc: "Add a new student to the system", color: "from-teal-400 to-teal-500" },
              { href: "/admin/upload-students", icon: FaFileUpload, title: "Bulk Upload", desc: "Upload multiple students via CSV", color: "from-orange-400 to-orange-500" },
              { href: "/admin/verify-certificate", icon: FaCheckCircle, title: "Verify Certificate", desc: "Verify student clearance certificates", color: "from-green-400 to-green-500" },
              { href: "/admin/manage-admins", icon: FaUserCog, title: "Manage Admins", desc: "Add or remove system administrators", color: "from-purple-400 to-purple-500" },
            ].map((item, index) => (
              <Link 
                key={index} 
                href={item.href} 
                className={`bg-gradient-to-br ${item.color} rounded-2xl shadow-md p-6 hover:shadow-xl transition-all duration-300 flex flex-col items-start text-white group transform hover:scale-105 hover:-translate-y-1`}
              >
                <div className="w-14 h-14 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-4 group-hover:bg-opacity-30 transition-all duration-300">
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-2">{item.title}</h2>
                <p className="text-sm text-white opacity-80">{item.desc}</p>
                <div className="mt-4 self-end">
                  <span className="text-xs font-semibold bg-white bg-opacity-20 px-3 py-1 rounded-full">
                    Explore
                  </span>
                </div>
              </Link>
            ))}
          </div>
          {/* <div className="bg-gradient-to-br from-gray-900 to-indigo-900 rounded-3xl shadow-2xl flex flex-col h-96 overflow-hidden transition-all duration-300 hover:shadow-indigo-500/30">
            <div className="px-6 py-5 flex items-center justify-between bg-black bg-opacity-30 border-b border-indigo-500/30">
              <h3 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300 flex items-center gap-3">
                <FaClipboardCheck className="w-7 h-7 text-indigo-400" />
                Recent Activity
              </h3>
              <button
                onClick={() => addActivity('update', 'Dashboard refreshed')}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold transition-all duration-300 text-white transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                title="Refresh Activities"
              >
                <FaChartLine className="w-4 h-4 animate-pulse" />
                <span>Refresh</span>
              </button>
            </div>
            <div className="flex-1 p-5 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-600 scrollbar-track-gray-800 bg-gradient-to-b from-gray-800/50 to-gray-900/50">
              <div className="space-y-4 relative">
                {activityListContent}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-20 pointer-events-none"></div>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}
