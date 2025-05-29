"use client";
import { useState, useEffect, useCallback } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';

/**
 * A professional-looking notification component that appears in the center of the screen
 * 
 * @param {Object} props Component props
 * @param {string} props.type The type of notification: 'success', 'error', or 'info'
 * @param {string} props.message The message to display in the notification
 * @param {boolean} props.show Whether to show the notification
 * @param {function} props.onClose Function to call when notification is closed
 * @param {number} props.duration Duration in ms before auto-closing (default: 3000, set to 0 to disable)
 */
export default function CenterNotification({ type = 'info', message, show, onClose, duration = 3000 }) {
  const [visible, setVisible] = useState(false);
  
  // Handle closing the notification with animation - wrapped in useCallback to prevent recreation on each render
  const handleClose = useCallback(() => {
    setVisible(false);
    // Wait for animation to complete before calling onClose
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  }, [onClose]);
  
  // Handle animation states
  useEffect(() => {
    if (show) {
      setVisible(true);
      
      // Auto-close after duration if specified
      if (duration > 0) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);
        
        return () => clearTimeout(timer);
      }
    }
  }, [show, duration, handleClose]);
  
  if (!show) return null;
  
  // Determine icon and colors based on notification type
  let icon;
  let bgColor;
  let borderColor;
  let textColor;
  
  switch (type) {
    case 'success':
      icon = <FaCheckCircle className="h-6 w-6 text-green-500" />;
      bgColor = 'bg-green-50';
      borderColor = 'border-green-500';
      textColor = 'text-green-800';
      break;
    case 'error':
      icon = <FaExclamationCircle className="h-6 w-6 text-red-500" />;
      bgColor = 'bg-red-50';
      borderColor = 'border-red-500';
      textColor = 'text-red-800';
      break;
    case 'info':
    default:
      icon = <FaInfoCircle className="h-6 w-6 text-blue-500" />;
      bgColor = 'bg-blue-50';
      borderColor = 'border-blue-500';
      textColor = 'text-blue-800';
  }
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30 transition-opacity duration-300 ease-in-out"
         style={{ opacity: visible ? 1 : 0 }}
         onClick={(e) => {
           // Close when clicking outside the notification
           if (e.target === e.currentTarget) handleClose();
         }}>
      <div className={`${bgColor} border-l-4 ${borderColor} p-4 rounded-md shadow-xl max-w-md transform transition-all duration-300 ease-in-out ${visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        <div className="flex items-start">
          <div className="flex-shrink-0 mt-0.5">
            {icon}
          </div>
          <div className="ml-3 flex-1">
            <p className={`text-sm font-medium ${textColor}`}>{message}</p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className={`inline-flex ${textColor} hover:opacity-75 focus:outline-none`}
              onClick={handleClose}
            >
              <FaTimes className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
