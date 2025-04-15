# Dental Clinic Appointment Chatbot POC

This is a Proof of Concept (POC) for an intelligent chatbot designed to manage dental clinic appointments through a chat interface. The chatbot handles scheduling and rescheduling of appointments using natural language processing.

## Features

- **Appointment Scheduling**: Book dental appointments through a conversational interface
- **Availability Checking**: Automatically check for available time slots
- **Appointment Rescheduling**: Reschedule existing appointments with ease

## Tech Stack

- **Next.js**: Full-stack React framework for building the application
- **SuperBase**: PostgreSQL-based database for storing appointment data
- **OpenAI API via AI SDK**: For natural language understanding and generation
- **Function Calling**: For executing specific actions based on AI decisions

## Getting Started

### Prerequisites

- Node.js 18.0.0 or later
- A Supabase account
- An OpenAI API key (for later stages)

### Setup

1. Clone the repository
   ```bash
   git clone [repository-url]
   cd dental-chatbot-poc
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up the Supabase database
   - Follow the instructions in `docs/database-setup-guide.md`

4. Create `.env.local` file with your credentials
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   OPENAI_API_KEY=your-openai-api-key
   ```

5. Start the development server
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Implementation Plan

The implementation follows a step-by-step approach:

1. **Set Up SuperBase Database** ✅
2. Initialize Next.js Project
3. Implement Backend Functions
4. Integrate AI with Function Calling
5. Develop Frontend Chat Interface
6. End-to-End Testing and Deployment

## Documentation

- [Database Setup Guide](docs/database-setup-guide.md)
- Implementation Plan (in memory-bank folder)
- Design Document (in memory-bank folder)
