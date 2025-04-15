import { tool as createTool } from 'ai';
import { z } from 'zod';
import { check_availability } from './appointmentFunctions';

export const appointmentAvailabilityTool = createTool({
  description: 'Check available appointment slots for a given date',
  parameters: z.object({
    date: z.string().describe('The date to check appointment availability for (Format: YYYY-MM-DD)'),
    dentist_id: z.string().optional().describe('Dentist ID (defaults to 1 for Dr. Smith)')
  }),
  execute: async function ({ date, dentist_id = '1' }) {
    try {
      const availableSlots = await check_availability(date, dentist_id);
      return {
        date,
        availableSlots,
        dentist_id
      };
    } catch (error) {
      console.error('Error checking appointment availability:', error);
      return {
        date,
        availableSlots: [],
        dentist_id,
        error: 'Failed to check availability'
      };
    }
  },
});

export const tools = {
  checkAppointmentAvailability: appointmentAvailabilityTool,
}; 