# Supabase Database Setup Guide

This guide provides step-by-step instructions for setting up the Supabase database for the Dental Clinic Appointment Chatbot POC.

## Prerequisites

- A Supabase account (Sign up at [supabase.com](https://supabase.com) if you don't have one)

## Steps

### 1. Create a New Supabase Project

1. Log in to your Supabase account
2. Click "New Project"
3. Enter a name for your project (e.g., "dental-clinic-chatbot")
4. Choose a secure password for the database (save it somewhere secure)
5. Select a region closest to your target users
6. Click "Create new project"

### 2. Create Database Tables

Once your project is created, you need to set up the database tables. You can do this through the SQL Editor in the Supabase dashboard.

1. In your Supabase project dashboard, click on "SQL Editor" in the left sidebar
2. Click "New query"
3. Copy and paste the contents of `lib/database-setup.sql` into the editor
4. Click "Run" to execute the SQL statements

The SQL script will:
- Create the Patients table
- Create the Dentists table
- Create the Appointments table
- Insert the default dentist (Dr. Smith)
- Insert a test patient and appointments for testing

### 3. Get Your API Credentials

To connect your Next.js app to Supabase, you need the API credentials:

1. In your Supabase project dashboard, go to "Settings" (gear icon) in the left sidebar
2. Click on "API" in the settings menu
3. Under "Project API keys," you'll find:
   - URL: Your project URL (copy this)
   - anon public: Your anonymous key (copy this)

### 4. Configure Your Environment Variables

1. Create a `.env.local` file in the root of your Next.js project (use `.env.local.example` as a template)
2. Update the values:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
3. Save the file

### 5. Verify Database Connection

1. Start your Next.js dev server: `npm run dev`
2. Visit `http://localhost:3000/api/test-db` in your browser
3. If successful, you should see a JSON response with the dentist data
4. If there's an error, check your environment variables and make sure they're correctly set

## Database Schema

### Patients
- `id`: Integer, primary key, auto-increment
- `name`: String, required
- `email`: String, optional
- `phone`: String, optional

### Dentists
- `id`: Integer, primary key, auto-increment
- `name`: String, required
- `specialization`: String, required

### Appointments
- `id`: Integer, primary key, auto-increment
- `patient_id`: Integer, foreign key to Patients
- `dentist_id`: Integer, foreign key to Dentists
- `date`: Date, required
- `time`: Time, required
- `status`: String (e.g., "booked", "cancelled"), required

## Next Steps

After successful setup:
1. Verify the test database connections work
2. Proceed to Step 2 of the implementation plan 