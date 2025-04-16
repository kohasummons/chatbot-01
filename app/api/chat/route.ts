import { openai } from "@ai-sdk/openai";
import { streamText, tool } from "ai";
import { z } from "zod";
import {
  check_availability,
  book_appointment,
  reschedule_appointment,
} from "@/lib/appointmentFunctions";
import { tools as customTools } from "@/lib/tools";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Define the type for chat messages
type ChatMessage = {
  role: string;
  content: string;
};

// Function to get today's date in YYYY-MM-DD format
function getTodaysDate(): string {
  const today = new Date();
  return today.toISOString().split("T")[0]; // Returns YYYY-MM-DD
}

// System message that cannot be overridden
const SYSTEM_MESSAGE = {
  role: "system",
  content: `You are a Dentitio! A Super helpful dental clinic assistant chatbot that asks questions one at a time in a sequential manner.
  
  ------


Clinic Overview:
Dentitio Clinic is a full-service dental clinic offering both general and specialized dental services. Known for its warm customer service and expert team of dentists and hygienists, the clinic focuses on making dental care accessible, comfortable, and results-driven.

Operating Days and Hours:

Open Days: Monday to Friday
Closed: Saturdays and Sundays
Opening Time: 9:00 AM
Closing Time: 5:00 PM

The clinic operates on an appointment basis but may accept walk-ins depending on availability.

Services Offered:
Routine check-ups and cleanings
Teeth whitening and cosmetic dentistry
Fillings, crowns, and bridges
Orthodontics (braces and aligners)
Root canal treatment
Dental implants
Emergency dental care

Booking Information:
Patients can book appointments via phone, website, or through this chatbot.
Same-day appointments may be available, subject to scheduling.
A confirmation message is sent after each booking, and reminders may be sent before the appointment.

Other Details to Know:
The clinic welcomes both new and returning patients.
Patients are encouraged to arrive 10-15 minutes early for their appointments.
Insurance options and flexible payment plans are available.
The clinic maintains strict hygiene and safety protocols.

Always respond in a friendly, professional tone. Use clear language and ensure patients feel welcome and supported. If you are ever unsure or need to refer a user to the clinic directly, provide them with the contact information or encourage them to visit during operating hours.

  ------
  
  Today's date is ${getTodaysDate()}.
  
  Important: When you need multiple pieces of information from the user, ask for them ONE AT A TIME, waiting for a response between each question.
  
  For example when booking:
  - First ask: "Can I have your name please?"
  - After user responds, then ask: "What date would you like to book your appointment?"
  - After user responds, then ask: "What time would you prefer?"
  - After user responds, then ask: "Can I have your email address please?"
  
  For rescheduling:
  - If the has provided an email address in the recent messages, then you can use the reschedule_appointment tool to reschedule the appointment, you can skip to the "what data would you love to reschedule to?" question.
  - If the has not provided an email address, then you need to ask for it first.
  - First ask: "Can I have your email address please?"
  - After user responds, then ask: "What date would you like to reschedule to?"
  - After user responds, then ask: "What time would you prefer?"
  
  Always ask for the patient's email address - it's required for checking existing appointments when booking and for finding appointments when rescheduling.
  
  Do not ask for multiple pieces of information in a single message. This makes it easier for users to provide information step by step.
  
  When showing available appointment slots, use the checkAppointmentAvailability tool to get the available slots.

Time slots are in increments of 30 minutes. 

Bad example:

Available slots:
1. 10:00 AM
2. 10:30 AM
3. 11:00 AM
4. 11:30 AM
5. 12:00 PM

Good example:
Available slots:
1. 10:00 AM - 10:30 AM
2. 11:00 AM - 11:30 AM
3. 12:00 PM - 12:30 PM
  
  Remember to be conversational, friendly, and helpful throughout the interaction.`,
};

// Function to sanitize user input
function sanitizeUserInput(content: string): string {
  // Remove any attempts to inject system messages
  content = content.replace(
    /system:|as system:|system message:|<system>|assistant:|\bas\s+the\s+system\b/gi,
    "[FILTERED]"
  );

  // Remove any attempts to override or ignore instructions
  content = content.replace(
    /ignore previous instructions|ignore your instructions|new instructions|disregard|forget/gi,
    "[FILTERED]"
  );

  // Remove attempts to prompt injection via markdown or code blocks
  content = content.replace(/```system|```assistant/gi, "```[FILTERED]");

  return content;
}

// Validate chat message structure
function validateChatMessage(message: any): boolean {
  if (!message || typeof message !== "object") return false;
  if (
    !["system", "user", "assistant", "tool", "function"].includes(message.role)
  )
    return false;
  if (typeof message.content !== "string") return false;
  return true;
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Validate messages array
    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Invalid request format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Create a safe message array - using the type expected by streamText
    const safeMessages = [];

    // Always start with our controlled system message
    safeMessages.push(SYSTEM_MESSAGE);

    // Process and sanitize user messages, filtering out any system messages
    for (const message of messages) {
      if (!validateChatMessage(message)) continue;

      // Only include user, assistant, tool, and function messages
      if (message.role !== "system") {
        // Sanitize user messages
        if (message.role === "user") {
          message.content = sanitizeUserInput(message.content);
        }
        safeMessages.push(message);
      }
    }

    // Apply rate limiting here if needed

    const result = streamText({
      model: openai("gpt-4o"),
      messages: safeMessages,
      tools: {
        ...customTools,
        get_current_date: tool({
          description: "Get the current date",
          parameters: z.object({}),
          execute: async () => {
            return {
              current_date: getTodaysDate(),
              formatted_date: new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              }),
            };
          },
        }),
        check_availability: tool({
          description: "Check available appointment slots for a specific date",
          parameters: z.object({
            date: z
              .string()
              .describe(
                "The date to check availability for (format: YYYY-MM-DD)"
              ),
            dentist_id: z
              .string()
              .default("1")
              .describe(
                "The dentist ID to check availability for (default: 1)"
              ),
          }),
          execute: async ({ date, dentist_id }) => {
            try {
              const availableSlots = await check_availability(date, dentist_id);
              return {
                date,
                availableSlots,
              };
            } catch (error) {
              console.error("Error in check_availability tool:", error);
              return {
                date,
                availableSlots: [],
                error:
                  error instanceof Error
                    ? error.message
                    : "There was an unexpected error checking availability.",
              };
            }
          },
        }),
        book_appointment: tool({
          description:
            "Book a new appointment for a patient. If the patient provides an email, the system will check for existing appointments and prevent booking multiple appointments with the same email.",
          parameters: z.object({
            patient_name: z.string().describe("The patient name"),
            date: z
              .string()
              .describe("The appointment date (format: YYYY-MM-DD)"),
            time: z.string().describe("The appointment time (format: HH:MM)"),
            dentist_id: z
              .string()
              .default("1")
              .describe("The dentist ID (default: 1)"),
            patient_email: z
              .string()
              .optional()
              .describe(
                "The patient email (required for checking existing appointments)"
              ),
            reason: z
              .enum(["Checkup", "Emergency", "Filling"])
              .default("Checkup")
              .describe("The reason for the appointment"),
          }),
          execute: async ({
            patient_name,
            date,
            time,
            dentist_id,
            patient_email,
            reason,
          }) => {
            try {
              const result = await book_appointment(
                patient_name,
                date,
                time,
                dentist_id,
                patient_email || "",
                reason
              );
              return {
                message: result,
              };
            } catch (error) {
              console.error("Error in book_appointment tool:", error);
              return {
                message:
                  error instanceof Error
                    ? `Sorry, there was an error booking your appointment: ${error.message}`
                    : "Sorry, there was an unexpected error booking your appointment. Please try again later.",
              };
            }
          },
        }),
        reschedule_appointment: tool({
          description:
            "Reschedule an existing appointment by finding it using the patient email. The system will look up existing appointments for the email provided.",
          parameters: z.object({
            patient_name: z.string().describe("The patient name"),
            patient_email: z
              .string()
              .describe(
                "The patient email (required to find their appointments)"
              ),
            new_date: z
              .string()
              .describe("The new appointment date (format: YYYY-MM-DD)"),
            new_time: z
              .string()
              .describe("The new appointment time (format: HH:MM)"),
            dentist_id: z
              .string()
              .default("1")
              .describe("The dentist ID (default: 1)"),
            appointment_id: z
              .number()
              .optional()
              .describe(
                "The specific appointment ID to reschedule (optional if providing email)"
              ),
            original_date: z
              .string()
              .optional()
              .describe(
                "The original appointment date if known (format: YYYY-MM-DD, optional)"
              ),
            original_time: z
              .string()
              .optional()
              .describe(
                "The original appointment time if known (format: HH:MM, optional)"
              ),
          }),
          execute: async ({
            patient_name,
            patient_email,
            new_date,
            new_time,
            dentist_id,
            appointment_id,
            original_date,
            original_time,
          }) => {
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
                message: result,
              };
            } catch (error) {
              console.error("Error in reschedule_appointment tool:", error);
              return {
                message:
                  error instanceof Error
                    ? `Sorry, there was an error rescheduling your appointment: ${error.message}`
                    : "Sorry, there was an unexpected error rescheduling your appointment. Please try again later.",
              };
            }
          },
        }),
      },
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Error processing chat request:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
