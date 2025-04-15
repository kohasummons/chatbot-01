import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { check_availability, book_appointment, reschedule_appointment } from '@/lib/appointmentFunctions';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    messages,
    tools: {
      check_availability: tool({
        description: 'Check available appointment slots for a specific date',
        parameters: z.object({
          date: z.string().describe('The date to check availability for (format: YYYY-MM-DD)'),
          dentist_id: z.string().default('1').describe('The dentist ID to check availability for (default: 1)')
        }),
        execute: async ({ date, dentist_id }) => {
          const availableSlots = await check_availability(date, dentist_id);
          return {
            date,
            availableSlots
          };
        },
      }),
      book_appointment: tool({
        description: 'Book a new appointment for a patient',
        parameters: z.object({
          patient_name: z.string().describe('The patient name'),
          date: z.string().describe('The appointment date (format: YYYY-MM-DD)'),
          time: z.string().describe('The appointment time (format: HH:MM)'),
          dentist_id: z.string().default('1').describe('The dentist ID (default: 1)'),
          patient_email: z.string().optional().describe('The patient email (optional)')
        }),
        execute: async ({ patient_name, date, time, dentist_id, patient_email }) => {
          const result = await book_appointment(patient_name, date, time, dentist_id, patient_email || '');
          return {
            message: result
          };
        },
      }),
      reschedule_appointment: tool({
        description: 'Reschedule an existing appointment',
        parameters: z.object({
          patient_name: z.string().describe('The patient name'),
          original_date: z.string().describe('The original appointment date (format: YYYY-MM-DD)'),
          original_time: z.string().describe('The original appointment time (format: HH:MM)'),
          new_date: z.string().describe('The new appointment date (format: YYYY-MM-DD)'),
          new_time: z.string().describe('The new appointment time (format: HH:MM)'),
          dentist_id: z.string().default('1').describe('The dentist ID (default: 1)'),
          patient_email: z.string().optional().describe('The patient email (optional)')
        }),
        execute: async ({ patient_name, original_date, original_time, new_date, new_time, dentist_id, patient_email }) => {
          const result = await reschedule_appointment(
            patient_name, 
            original_date, 
            original_time, 
            new_date, 
            new_time, 
            dentist_id, 
            patient_email || ''
          );
          return {
            message: result
          };
        },
      }),
    },
  });

  return result.toDataStreamResponse();
} 