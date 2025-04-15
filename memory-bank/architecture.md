# Architecture Documentation

This document provides an overview of the project architecture and explains the purpose of each file in the codebase.

## Project Structure

```
chatbot-dental-clinic/
├── app/
│   ├── api/
│   │   └── test-db/
│   │       └── route.ts        # API route for testing database connection
│   ├── globals.css             # Global CSS styles
│   ├── layout.tsx              # Root layout component
│   ├── page.tsx                # Homepage component
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
  - `book_appointment`: (Placeholder) Will handle appointment booking in Step 4
  - `reschedule_appointment`: (Placeholder) Will handle appointment rescheduling in Step 5
  - `testDatabaseConnection`: Tests the database connection by querying the default dentist

#### `/lib/database-setup.sql`
- **Purpose**: Contains SQL scripts for setting up the database
- **Functionality**:
  - Creates tables for Patients, Dentists, and Appointments
  - Inserts the default dentist and test data

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
  - OpenAI API key (for future use)

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

3. **API Testing**:
   - The `/api/test-db` endpoint calls `testDatabaseConnection`
   - The function queries the Dentists table for the default dentist
   - The result is returned as JSON to verify database connectivity
