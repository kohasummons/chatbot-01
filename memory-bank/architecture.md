# Architecture Documentation

This document provides an overview of the project architecture and explains the purpose of each file in the codebase.

## Project Structure

```
chatbot-dental-clinic/
├── app/
│   ├── api/
│   │   ├── test-db/
│   │   │   └── route.ts        # API route for testing database connection
│   │   ├── check-availability/
│   │   │   └── route.ts        # API route for checking available slots
│   │   ├── book-appointment/
│   │   │   └── route.ts        # API route for booking appointments
│   │   ├── reschedule-appointment/
│   │   │   └── route.ts        # API route for rescheduling appointments
│   │   ├── insert-test-appointments/
│   │   │   └── route.ts        # API route for inserting test data
│   │   └── chat/
│   │       └── route.ts        # AI-powered chat API with function calling
│   ├── globals.css             # Global CSS styles
│   ├── layout.tsx              # Root layout component
│   ├── page.tsx                # Chat interface component
│   └── favicon.ico             # Site favicon
├── docs/
│   └── database-setup-guide.md # Guide for setting up Supabase database
├── lib/
│   ├── appointmentFunctions.ts # Functions for appointment management
│   ├── database-setup.sql      # SQL scripts for Supabase setup
│   └── supabase.ts             # Supabase client configuration
├── memory-bank/                # Project documentation
├── public/                     # Static assets
├── .env.local.example          # Example environment variables
├── package.json                # Project dependencies
└── README.md                   # Project overview
```

## Component Descriptions

### API Routes

#### `/app/api/test-db/route.ts`
- **Purpose**: Tests the connection to the Supabase database
- **Functionality**: 
  - Calls the `testDatabaseConnection` function from appointmentFunctions
  - Returns the result as JSON or an error message

#### `/app/api/check-availability/route.ts`
- **Purpose**: Provides an endpoint to check available appointment slots
- **Functionality**:
  - Accepts date and optional dentist_id as parameters
  - Calls the `check_availability` function and returns available time slots

#### `/app/api/book-appointment/route.ts`
- **Purpose**: Provides an endpoint to book new appointments
- **Functionality**:
  - Accepts patient_name, date, time, and optional parameters
  - Calls the `book_appointment` function to create a new appointment

#### `/app/api/reschedule-appointment/route.ts`
- **Purpose**: Provides an endpoint to reschedule existing appointments
- **Functionality**:
  - Accepts patient details and original/new appointment parameters
  - Calls the `reschedule_appointment` function to update an appointment

#### `/app/api/chat/route.ts`
- **Purpose**: AI-powered chat endpoint with function calling
- **Functionality**:
  - Uses AI SDK to integrate with OpenAI's API
  - Defines function schemas for appointment-related operations
  - Handles streaming responses for real-time chat
  - Processes multi-step tool calls for complex interactions

### Library Files

#### `/lib/supabase.ts`
- **Purpose**: Configures and exports the Supabase client
- **Functionality**:
  - Initializes the Supabase connection using environment variables
  - Creates and exports a single instance of the Supabase client for the entire app

#### `/lib/appointmentFunctions.ts`
- **Purpose**: Contains all functions related to appointment management
- **Functionality**:
  - `check_availability`: Returns available time slots for a given date
  - `book_appointment`: Handles appointment booking process including patient creation
  - `reschedule_appointment`: Handles rescheduling of existing appointments
  - `testDatabaseConnection`: Tests the database connection by querying the default dentist

#### `/lib/database-setup.sql`
- **Purpose**: Contains SQL scripts for setting up the database
- **Functionality**:
  - Creates tables for Patients, Dentists, and Appointments
  - Inserts the default dentist and test data

### Pages and Components

#### `/app/page.tsx`
- **Purpose**: Main chat interface for the application
- **Functionality**:
  - Uses the `useChat` hook from AI SDK to manage chat state
  - Provides a floating chat button that opens a chat modal
  - Renders chat messages with support for different message types
  - Handles user input and form submission
  - Displays loading states and animations

### Documentation

#### `/docs/database-setup-guide.md`
- **Purpose**: Provides step-by-step instructions for setting up the Supabase database
- **Contents**:
  - Creating a Supabase project
  - Setting up database tables
  - Getting API credentials
  - Configuring environment variables
  - Testing the database connection

### Configuration Files

#### `/.env.local.example`
- **Purpose**: Serves as a template for environment variables
- **Contains**:
  - Supabase URL and anonymous key
  - OpenAI API key for AI integration

## Database Schema

### Patients Table
- `id`: Integer, primary key, auto-increment
- `name`: String, required
- `email`: String, optional
- `phone`: String, optional

### Dentists Table
- `id`: Integer, primary key, auto-increment
- `name`: String, required
- `specialization`: String, required

### Appointments Table
- `id`: Integer, primary key, auto-increment
- `patient_id`: Integer, foreign key to Patients
- `dentist_id`: Integer, foreign key to Dentists
- `date`: Date, required
- `time`: Time, required
- `status`: String (e.g., "booked", "cancelled"), required

## Data Flow

1. **Database Connection**:
   - The Supabase client is initialized in `lib/supabase.ts` using environment variables
   - The client is exported and imported by other files that need database access

2. **Appointment Availability Check**:
   - The `check_availability` function generates all possible time slots
   - It queries the Appointments table to get all booked slots for the specified date
   - It returns the available slots by filtering out the booked ones

3. **Appointment Booking Process**:
   - The `book_appointment` function checks if the requested slot is available
   - It verifies if the patient exists and creates a new record if needed
   - It inserts a new appointment record with the patient, dentist, date, and time

4. **Appointment Rescheduling Process**:
   - The `reschedule_appointment` function finds the patient's ID
   - It queries for a matching appointment in the database
   - It checks if the new slot is available
   - It updates the appointment record with the new date and time

5. **AI-Powered Chat Flow**:
   - User sends a message through the chat interface
   - The message is sent to the `/api/chat` endpoint
   - The AI SDK processes the message using OpenAI's API
   - If the AI identifies an intent to book or reschedule, it calls the appropriate function
   - Results from function calls are processed by the AI to generate natural language responses
   - The response is streamed back to the user in real-time
   - Multi-step interactions are handled through the `maxSteps` parameter
