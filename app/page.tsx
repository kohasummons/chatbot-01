'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useRef, ReactNode } from 'react';
import { motion } from 'framer-motion';

// Components
import { Message } from './components/message';
import { useScrollToBottom } from './components/use-scroll-to-bottom';
import { DentalIcon } from './components/icons';
import { AppointmentSlots } from '@/components/AppointmentSlots';

export default function ChatPage() {
  const { messages: chatMessages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    maxSteps: 5, // Enable multi-step tool calls
  });

  const [isOpen, setIsOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const [messagesContainerRef, messagesEndRef] = 
    useScrollToBottom<HTMLDivElement>();

  const suggestedActions = [
    { title: "Book", label: "an appointment", action: "Book an appointment" },
    { title: "Check", label: "available dentists", action: "Check available dentists" },
    {
      title: "Reschedule",
      label: "my appointment",
      action: "Reschedule my appointment",
    },
    {
      title: "What are",
      label: "your office hours?",
      action: "What are your office hours?",
    },
  ];

  // Function to handle suggested action clicks
  const handleSuggestedAction = async (action: string) => {
    // Create a synthetic input change event
    const syntheticEvent = {
      target: { value: action }
    } as React.ChangeEvent<HTMLInputElement>;
    
    // Update the input field with the action text
    handleInputChange(syntheticEvent);
    
    // Create a synthetic form submit event
    const submitEvent = {
      preventDefault: () => {}
    } as React.FormEvent<HTMLFormElement>;
    
    // Submit the form
    await handleSubmit(submitEvent);
  };
  
  // Handle time slot selection
  const handleSlotSelect = (time: string) => {
    setSelectedSlot(time);
    
    // Automatically send the selected time to the chat
    const syntheticEvent = {
      target: { value: time }
    } as React.ChangeEvent<HTMLInputElement>;
    
    handleInputChange(syntheticEvent);
    
    const submitEvent = {
      preventDefault: () => {}
    } as React.FormEvent<HTMLFormElement>;
    
    handleSubmit(submitEvent);
  };

  // Helper function to render tool invocation parts
  const renderToolInvocation = (part: any, messageId: string, index: number) => {
    if (part.type !== 'tool-invocation') return null;
    
    // Handle checkAppointmentAvailability tool
    if (part.name === 'checkAppointmentAvailability') {
      if (part.state === 'complete' && part.result) {
        const { date, availableSlots } = part.result as { date: string; availableSlots: string[] };
        return (
          <div key={`${messageId}-${index}`} className="mt-3 -mx-2">
            <AppointmentSlots 
              date={date} 
              availableSlots={availableSlots} 
              onSelectSlot={handleSlotSelect}
              selectedSlot={selectedSlot || undefined}
            />
          </div>
        );
      }
      
      if (part.state === 'running') {
        return (
          <div key={`${messageId}-${index}`} className="text-xs italic mt-1">
            <span>Checking availability...</span>
          </div>
        );
      }
    }
    
    // Default tool invocation message
    return (
      <div key={`${messageId}-${index}`} className="text-xs italic mt-1">
        <span>Using appointment tool...</span>
      </div>
    );
  };

  return (
    <div className="flex flex-row justify-center pb-20 h-dvh bg-white">
      {/* Chat button that opens the chat interface */}
      {!isOpen && (
        <div className="fixed bottom-8 right-8 z-40">
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
        <>
          {/* Semi-transparent backdrop - changed to white/transparent */}
          <div 
            className="fixed inset-0 bg-white bg-opacity-70 z-40 transition-opacity"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Chat popup window */}
          <div className="fixed bottom-20 right-8 z-50">
            <div className="bg-white rounded-lg shadow-xl w-[320px] sm:w-[350px] md:w-[420px] flex flex-col h-[500px] md:h-[600px] origin-bottom-right animate-scale-up">
              {/* Chat header */}
              <div className="border-b p-4 flex justify-between items-center">
                <h2 className="font-semibold">Dental Appointment Assistant</h2>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Chat messages */}
              <div 
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4"
              >
                {chatMessages.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="h-[350px] px-4 w-full pt-20"
                  >
                    <div className="border rounded-lg p-6 flex flex-col gap-4 text-zinc-500 text-sm">
                      <p className="flex flex-row justify-center items-center text-zinc-900">
                        <span className="text-xl font-semibold">Dental Clinic Assistant</span>
                      </p>
                      <p>
                        Welcome to our Dental Clinic chatbot! I'm here to help you book appointments,
                        reschedule visits, or answer any questions about our services.
                      </p>
                      <p>
                        Try asking about appointment availability, our dentists, or services we offer.
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  chatMessages.map((message) => (
                    <div 
                      key={message.id} 
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          message.role === 'user' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 text-zinc-800'
                        }`}
                      >
                        {message.parts.map((part, i) => {
                          switch (part.type) {
                            case 'text':
                              return <div key={`${message.id}-${i}`}>{part.text}</div>;
                            case 'tool-invocation':
                              return renderToolInvocation(part, message.id, i);
                            default:
                              return null;
                          }
                        })}
                      </div>
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-200 text-zinc-800 rounded-lg px-4 py-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse delay-150"></div>
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse delay-300"></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Suggested actions */}
              {chatMessages.length === 0 && (
                <div className="grid sm:grid-cols-2 gap-2 w-full px-4 mx-auto mb-4">
                  {suggestedActions.map((action, index) => (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      key={index}
                      className={index > 1 ? "hidden sm:block" : "block"}
                    >
                      <button
                        onClick={() => handleSuggestedAction(action.action)}
                        className="w-full text-left border border-zinc-200 text-zinc-800 rounded-lg p-2 text-sm hover:bg-zinc-100 transition-colors flex flex-col"
                      >
                        <span className="font-medium">{action.title}</span>
                        <span className="text-zinc-500">
                          {action.label}
                        </span>
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
              
              {/* Chat input */}
              <form onSubmit={handleSubmit} className="border-t p-4">
                <div className="flex space-x-2">
                  <input
                    ref={inputRef}
                    className="flex-1 bg-zinc-100 rounded-md px-4 py-2 text-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Send a message..."
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
        </>
      )}
    </div>
  );
}
