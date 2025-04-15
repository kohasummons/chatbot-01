import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { check_availability, book_appointment, reschedule_appointment } from '@/lib/appointmentFunctions';
import { tools as customTools } from '@/lib/tools';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Define the type for chat messages
type ChatMessage = {
  role: string;
  content: string;
};

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Add system message if not already present
  const systemMessage: ChatMessage = {
    role: 'system',
    content: `You are a helpful dental clinic assistant chatbot that asks questions one at a time in a sequential manner. 
    
    Important: When you need multiple pieces of information from the user, ask for them ONE AT A TIME, waiting for a response between each question.
    
    For example when booking:
    - First ask: "Can I have your name please?"
    - After user responds, then ask: "What date would you like to book your appointment?"
    - After user responds, then ask: "What time would you prefer?"
    - After user responds, then ask: "Can I have your email address please?"
    
    For rescheduling:
    - First ask: "Can I have your email address please? This helps us find your existing appointment."
    - After user responds, then ask: "What date would you like to reschedule to?"
    - After user responds, then ask: "What time would you prefer?"
    
    Always ask for the patient's email address - it's required for checking existing appointments when booking and for finding appointments when rescheduling.
    
    Do not ask for multiple pieces of information in a single message. This makes it easier for users to provide information step by step.
    
    When showing available appointment slots, use the checkAppointmentAvailability tool to get the available slots and display them visually to the user.
    
    Remember to be conversational, friendly, and helpful throughout the interaction.`
  };

  // Check if we need to add the system message
  if (!messages.some((msg: ChatMessage) => msg.role === 'system')) {
    messages.unshift(systemMessage);
  }

  const result = streamText({
    model: openai('gpt-4o'),
    messages,
    tools: {
      ...customTools,
      check_availability: tool({
        description: 'Check available appointment slots for a specific date',
        parameters: z.object({
          date: z.string().describe('The date to check availability for (format: YYYY-MM-DD)'),
          dentist_id: z.string().default('1').describe('The dentist ID to check availability for (default: 1)')
        }),
        execute: async ({ date, dentist_id }) => {
          try {
            const availableSlots = await check_availability(date, dentist_id);
            return {
              date,
              availableSlots
            };
          } catch (error) {
            console.error('Error in check_availability tool:', error);
            return {
              date,
              availableSlots: [],
              error: error instanceof Error 
                ? error.message 
                : "There was an unexpected error checking availability."
            };
          }
        },
      }),
      book_appointment: tool({
        description: 'Book a new appointment for a patient. If the patient provides an email, the system will check for existing appointments and prevent booking multiple appointments with the same email.',
        parameters: z.object({
          patient_name: z.string().describe('The patient name'),
          date: z.string().describe('The appointment date (format: YYYY-MM-DD)'),
          time: z.string().describe('The appointment time (format: HH:MM)'),
          dentist_id: z.string().default('1').describe('The dentist ID (default: 1)'),
          patient_email: z.string().optional().describe('The patient email (required for checking existing appointments)')
        }),
        execute: async ({ patient_name, date, time, dentist_id, patient_email }) => {
          try {
            const result = await book_appointment(patient_name, date, time, dentist_id, patient_email || '');
            return {
              message: result
            };
          } catch (error) {
            console.error('Error in book_appointment tool:', error);
            return {
              message: error instanceof Error 
                ? `Sorry, there was an error booking your appointment: ${error.message}`
                : "Sorry, there was an unexpected error booking your appointment. Please try again later."
            };
          }
        },
      }),
      reschedule_appointment: tool({
        description: 'Reschedule an existing appointment by finding it using the patient email. The system will look up existing appointments for the email provided.',
        parameters: z.object({
          patient_name: z.string().describe('The patient name'),
          patient_email: z.string().describe('The patient email (required to find their appointments)'),
          new_date: z.string().describe('The new appointment date (format: YYYY-MM-DD)'),
          new_time: z.string().describe('The new appointment time (format: HH:MM)'),
          dentist_id: z.string().default('1').describe('The dentist ID (default: 1)'),
          appointment_id: z.number().optional().describe('The specific appointment ID to reschedule (optional if providing email)'),
          original_date: z.string().optional().describe('The original appointment date if known (format: YYYY-MM-DD, optional)'),
          original_time: z.string().optional().describe('The original appointment time if known (format: HH:MM, optional)')
        }),
        execute: async ({ patient_name, patient_email, new_date, new_time, dentist_id, appointment_id, original_date, original_time }) => {
          try {
            const result = await reschedule_appointment(
              patient_name, 
              new_date, 
              new_time, 
              dentist_id, 
              patient_email,
              appointment_id,
              original_date,
              original_time
            );
            return {
              message: result
            };
          } catch (error) {
            console.error('Error in reschedule_appointment tool:', error);
            return {
              message: error instanceof Error 
                ? `Sorry, there was an error rescheduling your appointment: ${error.message}`
                : "Sorry, there was an unexpected error rescheduling your appointment. Please try again later."
            };
          }
        },
      }),
    },
  });

  return result.toDataStreamResponse();
} 