"use client";
import { useState } from 'react';
import { FaRobot, FaComments } from 'react-icons/fa';
import ChatBot from './ChatBot';

export default function ChatBotButton() {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  const toggleChatbot = () => {
    setIsChatbotOpen(prev => !prev);
  };

  return (
    <>
      <button
        onClick={toggleChatbot}
        className="fixed bottom-4 right-4 w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all z-40"
        aria-label="Open clearance assistant"
      >
        {isChatbotOpen ? <FaComments className="text-xl" /> : <FaRobot className="text-xl" />}
      </button>
      
      <ChatBot isOpen={isChatbotOpen} onClose={() => setIsChatbotOpen(false)} />
    </>
  );
}
