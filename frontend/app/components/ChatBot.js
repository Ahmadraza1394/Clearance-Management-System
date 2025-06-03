"use client";
import { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaTimes, FaRobot, FaUser, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import apiService from '../utils/api';

export default function ChatBot({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: 'Hello! I\'m your clearance assistant. How can I help you with your clearance process today?' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { auth } = useAuth();

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;
    
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Get student ID from auth context if available, otherwise use a default value
      const studentId = auth.isAuthenticated && auth.role === 'student' ? auth.user.id : 'guest';
      
      console.log('Sending chatbot query with studentId:', studentId);
      
      // Send message to backend
      const response = await apiService.post('/chatbot/query', {
        studentId: studentId,
        query: input
      });

      console.log('Chatbot response:', response);

      // Handle the response regardless of success property
      if (response && response.response) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: response.response 
        }]);
      } else if (response && response.message) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `Sorry, I encountered an issue: ${response.message}` 
        }]);
      } else {
        throw new Error('Failed to get a valid response from the server');
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Sorry, I encountered an error: ${error.message || 'Unknown error'}. Please try again later.` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-80 sm:w-96 h-[500px] bg-white rounded-lg shadow-xl flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <FaRobot className="mr-2 text-lg" />
          <h3 className="font-semibold">Clearance Assistant</h3>
        </div>
        <button 
          onClick={onClose}
          className="text-white hover:text-gray-200 transition-colors"
          aria-label="Close chatbot"
        >
          <FaTimes />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-gray-200 text-gray-800 rounded-tl-none'
              }`}
            >
              <div className="flex items-center mb-1">
                {message.role === 'user' ? (
                  <>
                    <span className="font-semibold mr-2">You</span>
                    <FaUser className="text-xs" />
                  </>
                ) : (
                  <>
                    <span className="font-semibold mr-2">Assistant</span>
                    <FaRobot className="text-xs" />
                  </>
                )}
              </div>
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-200 text-gray-800 rounded-lg rounded-tl-none max-w-[80%] px-4 py-2">
              <div className="flex items-center">
                <FaSpinner className="animate-spin mr-2" />
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-3 flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your clearance process..."
          className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          className={`bg-blue-600 text-white px-4 py-2 rounded-r-lg ${
            isLoading || !input.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
          }`}
          disabled={isLoading || !input.trim()}
        >
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
}
