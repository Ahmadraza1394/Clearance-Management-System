"use client";
import { createContext, useState, useContext, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "./AuthContext";
import apiService from "../utils/api";

// Initial state for the notification context
const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: true,
};

// Polling interval (2 minutes instead of 30 seconds to reduce API calls)
const POLLING_INTERVAL = 120000;

// Create the context
const NotificationContext = createContext(initialState);

// Notification Provider component
export const NotificationProvider = ({ children }) => {
  const [state, setState] = useState(() => {
    // Try to initialize from localStorage to prevent empty initial render
    try {
      const cachedNotifications = localStorage.getItem('userNotifications');
      if (cachedNotifications) {
        const parsed = JSON.parse(cachedNotifications);
        return {
          notifications: parsed.notifications || [],
          unreadCount: parsed.unreadCount || 0,
          loading: false
        };
      }
    } catch (error) {
      console.error('Error loading cached notifications:', error);
    }
    return initialState;
  });
  
  const { auth } = useAuth();

  // Fetch notifications from API - defined with useCallback before being used in useEffect
  const fetchNotifications = useCallback(async (force = false) => {
    if (!auth.user?.id) return;
    
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      // Get notifications with caching (force=true will bypass cache)
      const notifications = await apiService.get(
        `/notifications/student/${auth.user.id}`, 
        !force
      );
      
      // Get unread count with caching
      const unreadResponse = await apiService.get(
        `/notifications/student/${auth.user.id}/unread`, 
        !force
      );
      
      const newState = {
        notifications,
        unreadCount: unreadResponse.count,
        loading: false,
      };
      
      setState(newState);
      
      // Cache notifications in localStorage
      localStorage.setItem('userNotifications', JSON.stringify(newState));
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [auth.user?.id]);

  // Fetch notifications when user is authenticated
  useEffect(() => {
    if (auth.isAuthenticated && auth.role === "student") {
      // Force refresh on initial load or user change
      fetchNotifications(true);
      
      // Set up polling with longer interval to reduce API calls
      const interval = setInterval(() => fetchNotifications(false), POLLING_INTERVAL);
      
      return () => clearInterval(interval);
    } else {
      // Reset state when not authenticated
      setState({
        notifications: [],
        unreadCount: 0,
        loading: false,
      });
      // Clear cached notifications
      localStorage.removeItem('userNotifications');
    }
  }, [auth.isAuthenticated, auth.user?.id, auth.role, fetchNotifications]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await apiService.put(`/notifications/${notificationId}/read`);
      
      // Update local state
      const newState = prevState => {
        const updated = {
          ...prevState,
          notifications: prevState.notifications.map(notification => 
            notification._id === notificationId 
              ? { ...notification, is_read: true } 
              : notification
          ),
          unreadCount: Math.max(0, prevState.unreadCount - 1),
        };
        
        // Update cache in localStorage
        localStorage.setItem('userNotifications', JSON.stringify(updated));
        
        return updated;
      };
      
      setState(newState);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      // Get all unread notification IDs
      const unreadIds = state.notifications
        .filter(notification => !notification.is_read)
        .map(notification => notification._id);
      
      if (unreadIds.length === 0) return; // No unread notifications
      
      // Use Promise.all to mark all notifications as read in parallel
      await Promise.all(
        unreadIds.map(id => apiService.put(`/notifications/${id}/read`))
      );
      
      // Update local state
      const newState = {
        ...state,
        notifications: state.notifications.map(notification => ({ ...notification, is_read: true })),
        unreadCount: 0,
      };
      
      setState(newState);
      
      // Update cache in localStorage
      localStorage.setItem('userNotifications', JSON.stringify(newState));
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  }, [state, setState]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await apiService.delete(`/notifications/${notificationId}`);
      
      // Update local state
      setState(prev => {
        const isUnread = prev.notifications.find(n => n._id === notificationId && !n.is_read);
        const newState = {
          ...prev,
          notifications: prev.notifications.filter(n => n._id !== notificationId),
          unreadCount: isUnread ? Math.max(0, prev.unreadCount - 1) : prev.unreadCount,
        };
        
        // Update cache in localStorage
        localStorage.setItem('userNotifications', JSON.stringify(newState));
        
        return newState;
      });
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    ...state,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  }), [state, fetchNotifications, markAsRead, markAllAsRead, deleteNotification]);

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use notification context
export const useNotifications = () => useContext(NotificationContext);
