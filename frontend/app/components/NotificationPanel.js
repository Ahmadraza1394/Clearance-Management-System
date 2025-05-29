"use client";
import { useState, useEffect, useRef } from "react";
import { useNotifications } from "../context/NotificationContext";
import { FaBell, FaCheck, FaTrash, FaCheckDouble, FaTimes, FaInfoCircle, FaExclamationTriangle, FaCheckCircle } from "react-icons/fa";

export default function NotificationPanel() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef(null);

  const togglePanel = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      // Auto mark as read when opening
      setTimeout(() => markAllAsRead(), 3000);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = (e, id) => {
    e.stopPropagation();
    markAsRead(id);
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    deleteNotification(id);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = diffMs / (1000 * 60 * 60);
    
    if (diffHours < 24) {
      if (diffHours < 1) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        return diffMinutes <= 1 ? 'just now' : `${diffMinutes} minutes ago`;
      } else {
        const hours = Math.floor(diffHours);
        return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
      }
    }
    
    if (diffHours < 168) {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return days[date.getDay()];
    }
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const getNotificationTypeColor = (type) => {
    switch (type) {
      case "clearance":
        return "bg-green-50 border-l-4 border-green-500";
      case "message":
        return "bg-blue-50 border-l-4 border-blue-500";
      case "system":
        return "bg-gray-50 border-l-4 border-gray-500";
      default:
        return "bg-blue-50 border-l-4 border-blue-500";
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "clearance":
        return <FaCheckCircle className="text-green-500" />;
      case "message":
        return <FaInfoCircle className="text-blue-500" />;
      case "system":
        return <FaExclamationTriangle className="text-amber-500" />;
      default:
        return <FaInfoCircle className="text-blue-500" />;
    }
  };

  return (
    <div className="relative ml-4" ref={panelRef}>
      {/* Notification Bell */}
      <button
        onClick={togglePanel}
        className="absolute top-0 right-16 p-2 rounded-full hover:bg-gray-700 bg-gray-800 text-white focus:outline-none transition-colors duration-200"
        aria-label="Notifications"
      >
        <FaBell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl overflow-hidden z-50 border border-gray-100 animate-fadeIn backdrop-blur-lg">
          <div className="px-5 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <FaBell className="mr-2" /> Notifications
            </h3>
            <div className="flex space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs bg-white/10 hover:bg-white/20 text-white font-medium flex items-center px-2 py-1 rounded transition duration-200 backdrop-blur-sm"
                >
                  <FaCheckDouble className="mr-1" /> Mark all as read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 text-white p-1 rounded transition-colors duration-200"
                aria-label="Close notifications"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="max-h-[calc(100vh-220px)] overflow-y-auto bg-gradient-to-b from-white via-gray-50 to-white">
            {notifications.length === 0 ? (
              <div className="py-14 px-4 text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 shadow">
                  <FaBell className="h-8 w-8 text-blue-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-800">No notifications</h3>
                <p className="mt-2 text-sm text-gray-500">You're all caught up!</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <li
                    key={notification._id}
                    className={`group px-5 py-4 transition-all duration-200 relative cursor-pointer ${
                      !notification.is_read
                        ? "bg-gradient-to-r from-blue-50 via-white to-white border-l-4 border-blue-500"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 pt-1">
                        <div className={`h-10 w-10 flex items-center justify-center rounded-full shadow-md ${
                          notification.type === 'clearance'
                            ? "bg-green-50"
                            : notification.type === 'system'
                            ? "bg-amber-50"
                            : "bg-blue-50"
                        }`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <h4 className="text-base font-semibold text-gray-900 truncate flex items-center gap-2">
                            {notification.title}
                            {!notification.is_read && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200 animate-pulse">
                                New
                              </span>
                            )}
                          </h4>
                          <div className="flex space-x-1 ml-2 opacity-70 group-hover:opacity-100 transition-opacity">
                            {!notification.is_read && (
                              <button
                                onClick={(e) => handleMarkAsRead(e, notification._id)}
                                className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-100 transition"
                                title="Mark as read"
                              >
                                <FaCheck className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={(e) => handleDelete(e, notification._id)}
                              className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition"
                              title="Delete"
                            >
                              <FaTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className={`my-2 px-4 py-3 text-sm rounded-lg shadow-sm border ${
                          notification.type === 'clearance'
                            ? "bg-green-50 border-green-200"
                            : notification.type === 'system'
                            ? "bg-amber-50 border-amber-200"
                            : "bg-blue-50 border-blue-200"
                        }`}>
                          {notification.message.split("\n").map((line, i) => (
                            <p key={i} className={i > 0 ? "mt-2" : ""}>{line}</p>
                          ))}
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-gray-400 italic">{formatDate(notification.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
