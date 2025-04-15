'use client';

import { useChat } from '@ai-sdk/react';
import { useState } from 'react';

export default function ChatPage() {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    maxSteps: 5, // Enable multi-step tool calls
  });

  return (
    <div className="min-h-screen p-8 pb-20 font-sans">
      <h1 className="text-3xl font-bold text-center mb-8">Dental Clinic Appointment Chatbot</h1>
      
      {/* Chat button that opens the chat interface */}
      {!isOpen && (
        <div className="fixed bottom-8 right-8">
          <button
            onClick={() => setIsOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </button>
        </div>
      )}
      
      {/* Chat interface */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-xl w-full max-w-md flex flex-col h-[80vh]">
            {/* Chat header */}
            <div className="border-b dark:border-zinc-700 p-4 flex justify-between items-center">
              <h2 className="font-semibold">Dental Appointment Assistant</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>Welcome to the Dental Clinic chatbot!</p>
                  <p className="text-sm mt-2">Ask me about booking or rescheduling an appointment.</p>
                </div>
              )}
              
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 dark:bg-zinc-700 dark:text-white'
                    }`}
                  >
                    {message.parts.map((part, i) => {
                      switch (part.type) {
                        case 'text':
                          return <div key={`${message.id}-${i}`}>{part.text}</div>;
                        case 'tool-invocation':
                          return (
                            <div key={`${message.id}-${i}`} className="text-xs italic mt-1">
                              <span>Using appointment tool...</span>
                            </div>
                          );
                        default:
                          return null;
                      }
                    })}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 dark:bg-zinc-700 dark:text-white rounded-lg px-4 py-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-300 animate-pulse"></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-300 animate-pulse delay-150"></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-300 animate-pulse delay-300"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Chat input */}
            <form onSubmit={handleSubmit} className="border-t dark:border-zinc-700 p-4">
              <div className="flex space-x-2">
                <input
                  className="flex-1 border dark:border-zinc-700 rounded-lg px-4 py-2 dark:bg-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Type your message..."
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg px-4 py-2"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
