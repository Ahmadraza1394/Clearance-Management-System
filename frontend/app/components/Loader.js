"use client";
import React from 'react';

export default function Loader({ message = "Loading your data..." }) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex space-x-3 mb-4">
        <div className="w-4 h-4 bg-blue-600 rounded-full animate-pulse"></div>
        <div className="w-4 h-4 bg-indigo-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-4 h-4 bg-purple-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
      </div>
      <p className="text-gray-700 font-semibold text-lg">{message}</p>
    </div>
  );
}
