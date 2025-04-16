"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useRef, ReactNode } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

// Components
import { Message } from "./components/message";
import { useScrollToBottom } from "./components/use-scroll-to-bottom";
import { DentalIcon } from "./components/icons";
import { AppointmentSlots } from "@/components/AppointmentSlots";
import { AppointmentReasonSelector } from "@/components/AppointmentReasonSelector";

export default function ChatPage() {
  const {
    messages: chatMessages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
  } = useChat({
    maxSteps: 5, // Enable multi-step tool calls
  });

  const [isOpen, setIsOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [showReasonSelector, setShowReasonSelector] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const [containerRef, endRef] =
    useScrollToBottom<HTMLDivElement>();

  const suggestedActions = [
    { title: "Book", label: "an appointment", action: "Book an appointment" },
    {
      title: "Check",
      label: "available dentists",
      action: "Check available dentists",
    },
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
      target: { value: action },
    } as React.ChangeEvent<HTMLInputElement>;

    // Update the input field with the action text
    handleInputChange(syntheticEvent);

    // Create a synthetic form submit event
    const submitEvent = {
      preventDefault: () => {},
    } as React.FormEvent<HTMLFormElement>;

    // Submit the form
    await handleSubmit(submitEvent);
  };

  // Handle time slot selection
  const handleSlotSelect = (time: string) => {
    setSelectedSlot(time);
    setShowReasonSelector(true);

    // Don't submit yet, wait for reason selection
    if (!selectedReason) {
      return;
    }

    // If reason already selected, continue with booking
    submitTimeAndReason(time, selectedReason);
  };

  // Handle reason selection
  const handleReasonSelect = (reason: string) => {
    setSelectedReason(reason);

    // If time slot already selected, continue with booking
    if (selectedSlot) {
      submitTimeAndReason(selectedSlot, reason);
    }
  };

  // Submit both time and reason to chat
  const submitTimeAndReason = (time: string, reason: string) => {
    const message = `${time} for a ${reason}`;

    // Automatically send the selected time and reason to the chat
    const syntheticEvent = {
      target: { value: message },
    } as React.ChangeEvent<HTMLInputElement>;

    handleInputChange(syntheticEvent);

    const submitEvent = {
      preventDefault: () => {},
    } as React.FormEvent<HTMLFormElement>;

    handleSubmit(submitEvent);

    // Hide reason selector after submission
    setShowReasonSelector(false);
  };

  // Helper function to render tool invocation parts
  const renderToolInvocation = (
    part: any,
    messageId: string,
    index: number
  ) => {
    if (part.type !== "tool-invocation") return null;

    // Handle checkAppointmentAvailability tool
    if (part.name === "checkAppointmentAvailability") {
      if (part.state === "complete" && part.result) {
        const { date, availableSlots } = part.result as {
          date: string;
          availableSlots: string[];
        };
        return (
          <div key={`${messageId}-${index}`} className="mt-3 -mx-2">
            <AppointmentSlots
              date={date}
              availableSlots={availableSlots}
              onSelectSlot={handleSlotSelect}
              selectedSlot={selectedSlot || undefined}
            />
            {showReasonSelector && (
              <div className="mt-3">
                <AppointmentReasonSelector
                  onSelectReason={handleReasonSelect}
                  selectedReason={selectedReason || undefined}
                />
              </div>
            )}
          </div>
        );
      }

      if (part.state === "running") {
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
    <div className="flex flex-row justify-center bg-white">
      {/* Chat button that opens the chat interface */}
      {!isOpen && (
        <div className="fixed bottom-8 right-8 z-40">
          <button
            onClick={() => setIsOpen(true)}
            className="bg-black text-white rounded-full p-4 shadow-sm hover:shadow-lg flex items-center justify-center cursor-pointer"
          >
            <svg
              width="24px"
              height="24px"
              viewBox="0 0 1.44 1.44"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                width="48"
                height="48"
                fill="white"
                fill-opacity="0.01"
                d="M0 0H1.44V1.44H0V0z"
              />
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M0.394 0.15h0.027c0.14 0.021 0.178 0.1 0.3 0.1S0.88 0.171 1.02 0.15h0.015a0.285 0.285 0 0 1 0.285 0.285v0.019c0 0.087 -0.093 0.187 -0.12 0.281 -0.029 0.1 -0.049 0.182 -0.055 0.267C1.132 1.202 1.063 1.29 0.99 1.29c-0.11 0 -0.207 -0.449 -0.268 -0.449C0.661 0.841 0.539 1.29 0.45 1.29c-0.055 0 -0.125 -0.032 -0.152 -0.288C0.288 0.9 0.27 0.838 0.24 0.734c-0.026 -0.091 -0.115 -0.2 -0.12 -0.298A0.274 0.274 0 0 1 0.394 0.15Z"
                fill="#2F88FF"
                stroke="#000000"
                stroke-width="0.12"
              />
              <path
                d="m0.464 0.374 0.496 0.16"
                stroke="white"
                stroke-width="0.12"
                stroke-linecap="round"
              />
              <path
                d="m0.464 0.534 0.496 -0.16"
                stroke="white"
                stroke-width="0.12"
                stroke-linecap="round"
              />
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
              <div className="border-b border-zinc-200 p-4 flex justify-between items-center">
                <h2 className="font-semibold flex flex-row items-center gap-2">
                  Denttio Clinic
                  <span>
                    <svg
                      width="24px"
                      height="24px"
                      viewBox="0 0 1.44 1.44"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        width="48"
                        height="48"
                        fill="white"
                        fill-opacity="0.01"
                        d="M0 0H1.44V1.44H0V0z"
                      />
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M0.394 0.15h0.027c0.14 0.021 0.178 0.1 0.3 0.1S0.88 0.171 1.02 0.15h0.015a0.285 0.285 0 0 1 0.285 0.285v0.019c0 0.087 -0.093 0.187 -0.12 0.281 -0.029 0.1 -0.049 0.182 -0.055 0.267C1.132 1.202 1.063 1.29 0.99 1.29c-0.11 0 -0.207 -0.449 -0.268 -0.449C0.661 0.841 0.539 1.29 0.45 1.29c-0.055 0 -0.125 -0.032 -0.152 -0.288C0.288 0.9 0.27 0.838 0.24 0.734c-0.026 -0.091 -0.115 -0.2 -0.12 -0.298A0.274 0.274 0 0 1 0.394 0.15Z"
                        fill="#2F88FF"
                        stroke="#000000"
                        stroke-width="0.12"
                      />
                      <path
                        d="m0.464 0.374 0.496 0.16"
                        stroke="white"
                        stroke-width="0.12"
                        stroke-linecap="round"
                      />
                      <path
                        d="m0.464 0.534 0.496 -0.16"
                        stroke="white"
                        stroke-width="0.12"
                        stroke-linecap="round"
                      />
                    </svg>
                  </span>
                </h2>
                <div className="flex items-center space-x-3">
                  <Link
                    href="/dashboard"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </Link>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-500 hover:text-gray-700 cursor-pointer"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Chat messages */}
              <div
                ref={containerRef}
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
                        <span className="text-xl font-semibold">
                          DenttioBot
                        </span>
                      </p>
                      <p>
                        Welcome to Denttio Clinic! I'm here to help you book
                        appointments, reschedule visits, or answer any questions
                        about our services.
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  chatMessages.map((message) => (
                    <Message 
                      key={message.id} 
                      message={message} 
                      renderToolInvocation={(part, messageId, index) => 
                        renderToolInvocation(part, messageId, index)
                      } 
                    />
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
                <div ref={endRef} className="h-[1px]" />
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
                        className="w-full text-left border cursor-pointer border-zinc-200 text-zinc-800 rounded-lg p-2 text-sm hover:bg-zinc-100 transition-colors flex flex-col"
                      >
                        <span className="font-medium">{action.title}</span>
                        <span className="text-zinc-500">{action.label}</span>
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Chat input */}
              <form
                onSubmit={handleSubmit}
                className="border-t border-zinc-200 p-4"
              >
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
                    className="bg-black active:bg-black/80 text-white rounded-lg px-4 py-2 cursor-pointer"
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
