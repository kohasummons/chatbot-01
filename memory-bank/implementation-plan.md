# Implementation Plan for Dental Clinic Appointment Chatbot POC

This document provides a detailed, step-by-step implementation plan for building a Proof of Concept (POC) of an intelligent chatbot to manage dental clinic appointments. The chatbot will handle scheduling and rescheduling appointments through a chat interface, focusing on core functionalities to validate feasibility. The plan is designed for AI developers, using small, specific steps with tests to ensure correct implementation. The POC assumes a single dentist and prioritizes simplicity over full feature completeness.

## Assumptions for POC
- **Single Dentist**: All appointments are with one dentist (ID=1).
- **Appointment Duration**: Fixed at 30 minutes.
- **Patient Identification**: Patient names are unique for simplicity.
- **Error Handling**: Basic handling of common issues using console logging (e.g., unavailable slots, invalid inputs).
- **Focus**: Core scheduling and rescheduling capabilities, excluding optional features like cancellation.
- **Authentication**: No login functionality required for the POC.

## Tech Stack
- **Next.js**: Full-stack framework for frontend and backend.
- **SuperBase**: Database for storing patients, dentists, and appointments.
- **OpenAI API via AI SDK**: Powers the chatbot's conversational intelligence using the latest model.
- **Function Calling**: Enables AI to trigger backend actions.
- **Framer Motion**: Animation library for UI components.

## Steps

### Step 1: Set Up SuperBase Database
**Instructions:**
- Create a new SuperBase project in the SuperBase dashboard.
- Define the following tables with their fields:
  - **Patients**:
    - `id`: Integer, primary key, auto-increment
    - `name`: String, required
    - `email`: String, optional
    - `phone`: String, optional
  - **Dentists**:
    - `id`: Integer, primary key, auto-increment
    - `name`: String, required
    - `specialization`: String, required
  - **Appointments**:
    - `id`: Integer, primary key, auto-increment
    - `patient_id`: Integer, foreign key to Patients
    - `dentist_id`: Integer, foreign key to Dentists
    - `date`: Date, required
    - `time`: Time, required
    - `status`: String (e.g., "booked", "cancelled"), required
- Insert a single dentist record:
  - `id`: 1
  - `name`: "Dr. Smith"
  - `specialization`: "General Dentistry"

**Test:**
- Log in to the SuperBase dashboard.
- Confirm that the Patients, Dentists, and Appointments tables exist with the correct fields.
- Verify that the dentist record (ID=1, "Dr. Smith") is present in the Dentists table.

---

### Step 2: Initialize Next.js Project
**Instructions:**
- Run `npx create-next-app@latest dental-chatbot-poc` to create a new Next.js project.
- Navigate to the project directory: `cd dental-chatbot-poc`.
- Install the SuperBase client library: `npm install @supabase/supabase-js`.
- Install Framer Motion: `npm install framer-motion`.
- Create a `.env.local` file in the project root and add required credentials:
  - `NEXT_PUBLIC_SUPABASE_URL`: Your SuperBase project URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your SuperBase anonymous key
  - `OPENAI_API_KEY`: Your OpenAI API key

**Test:**
- Create a temporary API route at `pages/api/test-db.js`.
- In the route, use the SuperBase client to query the Dentists table for ID=1.
- Log the result to the console and return it in the response.
- Run the app with `npm run dev`, then use a browser or tool (e.g., curl) to visit `http://localhost:3000/api/test-db`.
- Confirm that the response includes "Dr. Smith" from the Dentists table.

---

### Step 3: Implement Backend Function - Check Availability
**Instructions:**
- Create a `/lib` directory in the project root.
- Add a file `/lib/appointmentFunctions.js`.
- Define a function `check_availability` that:
  - Takes parameters: `date` (string, YYYY-MM-DD), `dentist_id` (string, default "1").
  - Generates a list of time slots from 9:00 AM to 5:00 PM in 30-minute intervals (e.g., ["09:00", "09:30", ..., "17:00"]).
  - Queries the Appointments table for booked slots on the given date for dentist_id=1.
  - Returns an array of available slots (all slots minus booked ones).

**Test:**
- Manually insert two appointments in SuperBase for dentist_id=1:
  - Date: "2023-11-01", Time: "09:00", Status: "booked"
  - Date: "2023-11-01", Time: "10:00", Status: "booked"
- Call `check_availability` with date "2023-11-01" from a temporary API route or console.
- Verify that the returned array excludes "09:00" and "10:00" but includes other slots like "09:30", "10:30", etc.

---

### Step 4: Implement Backend Function - Book Appointment
**Instructions:**
- In `/lib/appointmentFunctions.js`, define `book_appointment` that:
  - Takes parameters: `patient_name` (string), `date` (string, YYYY-MM-DD), `time` (string, HH:MM), `dentist_id` (string, default "1").
  - Checks if the slot is available using `check_availability` or a direct query.
  - If unavailable, returns "Slot is already booked."
  - If available:
    - Queries Patients table for `patient_name`.
    - If no patient exists, inserts a new patient record with the name.
    - Inserts a new appointment record: `patient_id`, `dentist_id`=1, `date`, `time`, `status`="booked".
  - Returns "Appointment booked successfully."

**Test:**
- Call `book_appointment` with `patient_name="Jane Doe"`, `date="2023-11-01"`, `time="11:00"`.
- Check the SuperBase dashboard:
  - Confirm a new patient "Jane Doe" exists in Patients (if not already present).
  - Confirm an appointment exists with `date="2023-11-01"`, `time="11:00"`, `status="booked"`.
- Call `book_appointment` with `time="09:00"` (already booked).
- Verify it returns "Slot is already booked."

---

### Step 5: Implement Backend Function - Reschedule Appointment
**Instructions:**
- In `/lib/appointmentFunctions.js`, define `reschedule_appointment` that:
  - Takes parameters: `patient_name` (string), `original_date` (string), `original_time` (string), `new_date` (string), `new_time` (string).
  - Queries Appointments for an entry matching `patient_name` (via patient_id), `original_date`, `original_time`, `dentist_id`=1.
  - If no unique match, returns "Appointment not found or ambiguous."
  - If found, checks if `new_date` and `new_time` are available using `check_availability`.
  - If unavailable, returns "New slot is not available."
  - If available, updates the appointment's `date` and `time`.
  - Returns "Appointment rescheduled successfully."

**Test:**
- Ensure an appointment exists (e.g., "Jane Doe", "2023-11-01", "11:00").
- Call `reschedule_appointment` with `original_date="2023-11-01"`, `original_time="11:00"`, `new_date="2023-11-01"`, `new_time="12:00"`.
- Verify in SuperBase that the appointment's `time` updates to "12:00".
- Call with `new_time="09:00"` (booked).
- Confirm it returns "New slot is not available."

---

### Step 6: Integrate AI with Function Calling
**Instructions:**
- Install AI SDK: `npm install ai`.
- In `/lib/appointmentFunctions.js`, define schemas for `check_availability`, `book_appointment`, and `reschedule_appointment` with parameter descriptions.
- Create an API route at `pages/api/chat.js` that:
  - Accepts POST requests with `messages` (array of conversation history).
  - Uses AI SDK to send `messages` to the latest OpenAI model, including the function schemas.
  - If OpenAI returns a function call, executes the function from `/lib/appointmentFunctions.js` with provided arguments.
  - Appends the function result to `messages` and repeats until a text response is received.
  - Returns the final text response.

**Test:**
- Install Selenium for automated testing: `npm install selenium-webdriver`.
- Create a test script that sends a POST request to `http://localhost:3000/api/chat` with:
  - Body: `{ "messages": [{ "role": "user", "content": "I want to book an appointment" }] }`
- Verify the response asks for details (e.g., "Please provide your name").
- Send follow-up messages (e.g., "John Doe", "2023-11-02", "14:00") step-by-step.
- Confirm the AI calls `book_appointment` and responds with a confirmation.

---

### Step 7: Develop Frontend Chat Interface
**Instructions:**
- Replace `pages/index.js` with a React component that:
  - Has a chat bot button that opens a chat popup. tailwind css v4. 
  - Maintains conversation history in state (array of `{ role, content }` objects).
  - Displays messages in a scrollable list with animations using Framer Motion.
  - Includes a text input and send button.
  - On send, makes a POST request to `/api/chat` with the current `messages` array plus the new user message.
  - Updates the state with the user's message and the chatbot's response.
  - Ensures the interface is responsive and works well on mobile devices.

**Test:**
- Run the app and visit `http://localhost:3000`.
- Test on different screen sizes to verify mobile responsiveness.
- Type "I'd like an appointment" and click send.
- Verify the chatbot responds and the message appears in the history with proper animations.
- Complete a booking conversation and check that all messages display correctly.

---

### Step 8: Perform End-to-End Testing and Deployment
**Instructions:**
- Start the app with the database populated with some appointments (e.g., "2023-11-01" at "09:00" and "10:00").
- Create Selenium tests for the following scenarios:
  - Scheduling: Say "Book an appointment," provide "Alice Smith", "2023-11-01", "13:00".
  - Rescheduling: Say "Reschedule my appointment" for "Alice Smith", move from "13:00" to "14:00".
  - Error handling: Try booking "2023-11-01" at "09:00".
- Configure the project for Vercel deployment:
  - Create a `vercel.json` configuration file if needed.
  - Set up environment variables in the Vercel dashboard.
- Deploy to Vercel using the Vercel CLI or GitHub integration.

**Test:**
- Run the Selenium test suite to confirm all scenarios complete successfully.
- Verify the deployed application on Vercel works as expected.
- Test on various devices to confirm mobile responsiveness.

## Notes
- Focus on the happy path (successful scheduling/rescheduling) with console logging for error handling.
- The AI should guide users by asking for missing details (e.g., name, date).
- The frontend should use Framer Motion for smooth animations and transitions.
- Ensure the UI is responsive and works well on mobile devices.
- No authentication or login functionality is required for this POC.