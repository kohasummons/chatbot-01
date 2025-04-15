# Design Document: Intelligent Dental Clinic Appointment Chatbot POC

## Introduction

This document outlines the design for a Proof of Concept (POC) of an intelligent chatbot designed to manage dental clinic appointment scheduling through a chat interface. The chatbot will serve as an AI-powered assistant, capable of engaging with patients, interpreting their appointment requests, checking available time slots, and facilitating the scheduling or rescheduling of appointments. The primary objective of this POC is to validate the feasibility and effectiveness of automating appointment management in a dental clinic setting.

While this is a POC, a successful implementation could pave the way for a full-scale system with enhanced features, such as integration with Electronic Health Records (EHR) and Customer Relationship Management (CRM) systems, advanced AI capabilities, and support for multiple clinics.

## Requirements

The POC must meet the following functional requirements:

1. **Intent Recognition**: Identify whether the user intends to schedule a new appointment or reschedule an existing one.
2. **Information Extraction**: Capture essential details from user input, including the patient's name, preferred date and time, and appointment type.
3. **Availability Checking**: Verify the availability of appointment slots based on the user's preferences.
4. **Appointment Management**: Schedule new appointments or modify existing ones upon user confirmation.
5. **Conversational Interaction**: Deliver clear, helpful responses, guide users through the process, and handle errors (e.g., unavailable slots or invalid inputs) gracefully.

Non-functional requirements include:

- **Ease of Use**: The chatbot interface should be intuitive and user-friendly.
- **Responsiveness**: Responses must be generated promptly to ensure a smooth conversational experience.
- **Extensibility**: The design should support future enhancements without requiring extensive refactoring.

## Tech Stack

The POC will be built using the following technologies:

- **Next.js**: A full-stack React framework for developing the frontend and backend of the application.
- **SuperBase**: A PostgreSQL-based database for storing appointment, patient, and dentist data.
- **OpenAI API via AI SDK**: For powering the chatbot's natural language understanding and generation capabilities.
- **Function and Tool Calling**: To enable the AI to execute specific actions, such as querying the database or updating appointment records.

## System Architecture

The system architecture comprises the following components:

1. **Frontend**:
   - A chat interface built with React components within Next.js.
   - Displays the conversation history and provides an input field for user messages.

2. **Backend**:
   - Next.js API routes to process chat requests and manage interactions with the AI and database.
   - Handles function calls triggered by the AI to perform database operations.

3. **Database**:
   - SuperBase, hosting tables for patients, dentists, and appointments.
   - Provides persistent storage and retrieval of scheduling data.

4. **AI Integration**:
   - Utilizes the OpenAI API via the AI SDK for conversational intelligence.
   - Implements function calling to delegate tasks like availability checks and appointment bookings to the backend.

## Database Schema

The database will consist of the following tables:

### Patients
| Field       | Type         | Description                       |
|-------------|--------------|-----------------------------------|
| `id`        | Integer      | Primary key, auto-incremented     |
| `name`      | String       | Patient's full name               |
| `email`     | String       | Patient's email (optional for POC)|
| `phone`     | String       | Patient's phone (optional for POC)|

### Dentists
| Field           | Type         | Description                       |
|-----------------|--------------|-----------------------------------|
| `id`            | Integer      | Primary key, auto-incremented     |
| `name`          | String       | Dentist's full name               |
| `specialization`| String       | Dentist's area of expertise       |

### Appointments
| Field        | Type         | Description                           |
|--------------|--------------|---------------------------------------|
| `id`         | Integer      | Primary key, auto-incremented         |
| `patient_id` | Integer      | Foreign key referencing Patients      |
| `dentist_id` | Integer      | Foreign key referencing Dentists      |
| `date`       | Date         | Appointment date                      |
| `time`       | Time         | Appointment start time                |
| `status`     | String       | Appointment status (e.g., "booked", "cancelled") |

**Notes**: 
- For the POC, we will assume a single dentist to simplify implementation, with the `dentist_id` hardcoded. The schema, however, supports multiple dentists for future scalability.
- Appointment duration is assumed to be 30 minutes for simplicity.

## AI Integration

The chatbot will leverage the OpenAI API through the AI SDK to process natural language inputs and generate responses. Function calling will allow the AI to perform specific tasks by invoking predefined backend functions.

### Function Definitions

The following functions will be available for the AI to call:

1. **check_availability**
   - **Description**: Retrieves available appointment slots for a specified date and dentist.
   - **Parameters**:
     - `date` (string, format: YYYY-MM-DD): The requested date.
     - `dentist_id` (string, optional): The dentist's ID (hardcoded for POC).
   - **Returns**: An array of available time slots (e.g., ["10:00", "10:30"]).

2. **book_appointment**
   - **Description**: Books an appointment for a patient at a specified date and time.
   - **Parameters**:
     - `patient_name` (string): The patient's name.
     - `date` (string, format: YYYY-MM-DD): The appointment date.
     - `time` (string, format: HH:MM): The appointment time.
     - `dentist_id` (string, optional): The dentist's ID (hardcoded for POC).
   - **Returns**: A confirmation message (e.g., "success") or an error message.

3. **reschedule_appointment**
   - **Description**: Modifies an existing appointment to a new date and/or time. Requires identifying the original appointment.
   - **Parameters**:
     - `original_appointment_identifier` (string): Information to find the original appointment (e.g., patient name and original date/time, or an appointment ID).
     - `new_date` (string, format: YYYY-MM-DD): The new desired date.
     - `new_time` (string, format: HH:MM): The new desired time.
   - **Returns**: Confirmation details of the rescheduled appointment.

4. **cancel_appointment** (Optional)
   - **Description**: Cancels an existing appointment.
   - **Parameters**:
     - `appointment_identifier` (string): Information to find the appointment to cancel (e.g., patient name and date/time, or an appointment ID).
   - **Returns**: Confirmation that the appointment has been cancelled.

**Implementation Notes**:
- Functions will interact with SuperBase using SQL queries or its client library.
- For `check_availability`, the function generates a list of possible slots (e.g., 9:00 AM to 5:00 PM in 30-minute intervals) and excludes those already booked.
- For `book_appointment`, the function verifies slot availability before inserting a new record into the Appointments table. If the patient does not exist, a new record is created in the Patients table.
- For `reschedule_appointment`, the function verifies slot availability before updating the Appointments table.
- For `cancel_appointment`, the function deletes a record from the Appointments table.

### AI Interaction Flow

The AI processes user messages and decides whether to respond directly or call a function:
- The conversation history is sent to the OpenAI API with a list of available functions.
- The API returns either a text response or a function call with arguments.
- If a function is called, the backend executes it, appends the result to the conversation history, and sends another request to the AI until a user-facing message is generated.

## Chat Flow Example

Below is a sample conversation for scheduling an appointment:

1. **User**: "I need to book a dental appointment."
2. **Chatbot**: "Sure! Please provide your name."
3. **User**: "John Doe."
4. **Chatbot**: "Thank you, John. What date would you prefer for your appointment?"
5. **User**: "Next Monday."
6. **Chatbot**: "And what time would you like on next Monday?"
7. **User**: "2 PM."
8. **Chatbot**: "Let me check the availability for next Monday at 2 PM."
   - *[AI calls `check_availability` with date="2023-10-23", returns "available"]*
9. **Chatbot**: "Great! The 2 PM slot on Monday is available. Would you like to book it?"
10. **User**: "Yes."
11. **Chatbot**: "Please confirm: Appointment for John Doe on October 23, 2023, at 2:00 PM."
12. **User**: "Yes, that's correct."
13. **Chatbot**: "Your appointment has been booked successfully."
    - *[AI calls `book_appointment` with patient_name="John Doe", date="2023-10-23", time="14:00"]*

**Error Handling Example**:
- If the slot is unavailable:
  - **Chatbot**: "I'm sorry, the 2 PM slot on Monday is not available. Here are some alternatives: 1 PM or 3 PM. Which would you prefer?"

## Implementation Steps

1. **Initialize Next.js Project**:
   - Set up a new Next.js application using `create-next-app`.
   - Create React components for the chat interface (message list and input field).

2. **Configure SuperBase**:
   - Set up a SuperBase project and define the Patients, Dentists, and Appointments tables.
   - Implement database functions (`check_availability`, `book_appointment`) using SuperBase's JavaScript client.

3. **Integrate AI**:
   - Install the AI SDK and configure it with an OpenAI API key.
   - Define function schemas and implement their logic in the Next.js backend.
   - Create an API route (`/api/chat`) to handle messages, call the AI, and execute functions.

4. **Develop Frontend**:
   - Build the chat interface to send user messages to `/api/chat` and display responses.
   - Maintain conversation history in React state, sending it with each request.

5. **Test and Refine**:
   - Test the chatbot with scenarios like booking with valid/invalid inputs and handling unavailable slots.
   - Adjust AI prompts or logic based on test results to improve accuracy and usability.


   Design Document: Intelligent Dental Clinic Appointment Chatbot POC
1. Introduction
This document presents the design for a Proof of Concept (POC) of an intelligent chatbot that manages dental clinic appointment scheduling through a chat interface. The chatbot will interact with patients to schedule or reschedule appointments by understanding their requests, checking availability, and updating the database accordingly.

The POC aims to demonstrate the feasibility of automating appointment management using AI, with potential for future expansion into a full-scale system with advanced features like EHR/CRM integrations and multi-clinic support.

2. System Overview
The system will be built as a web application using Next.js, which provides a full-stack framework for both frontend and backend development. The chatbot will leverage the OpenAI API via the AI SDK for natural language understanding and generation, while SuperBase will serve as the database for storing appointment, patient, and dentist data.

Key Features
Intent Recognition: Determine if the user wants to schedule a new appointment or reschedule an existing one.
Information Extraction: Capture essential details such as patient name, preferred date, time, and appointment type.
Availability Checking: Verify available appointment slots based on user preferences.
Appointment Management: Schedule or reschedule appointments upon user confirmation.
Conversational Interaction: Provide clear, helpful responses and handle errors gracefully.
3. System Architecture
The system architecture consists of the following components:

3.1 Frontend
Chat Interface: A React-based chat interface built with Next.js, displaying the conversation history and an input field for user messages.
UI Components: Custom components to render dynamic UI elements (e.g., selectable appointment types or time slots) based on AI-generated responses.
3.2 Backend
API Routes: Next.js API routes to handle chat requests, process messages, and manage interactions with the AI and database.
Function and Tool Calling: Backend functions that the AI can invoke to perform tasks like checking availability or booking appointments.
3.3 Database
SuperBase: A PostgreSQL-based database to store data related to patients, dentists, and appointments.
Schema: Tables for Patients, Dentists, and Appointments, with relationships to manage scheduling data.
3.4 AI Integration
OpenAI API via AI SDK: Powers the chatbot’s natural language capabilities, including intent recognition, information extraction, and response generation.
Tools: Predefined functions that the AI can call to interact with the database or perform specific actions.
4. Database Schema
The database will include the following tables:

4.1 Patients
Field	Type	Description
id	Integer	Primary key, auto-incremented
name	String	Patient’s full name
email	String	Patient’s email (optional for POC)
phone	String	Patient’s phone (optional for POC)
4.2 Dentists
Field	Type	Description
id	Integer	Primary key, auto-incremented
name	String	Dentist’s full name
specialization	String	Dentist’s area of expertise
4.3 Appointments
Field	Type	Description
id	Integer	Primary key, auto-incremented
patient_id	Integer	Foreign key referencing Patients
dentist_id	Integer	Foreign key referencing Dentists
date	Date	Appointment date
time	Time	Appointment start time
status	String	Appointment status (e.g., "booked", "cancelled")
Notes:

For the POC, a single dentist will be assumed to simplify implementation, with the dentist_id hardcoded.
Appointment duration is assumed to be 30 minutes.
5. AI Integration and Tool Calling
The chatbot will use the OpenAI API via the AI SDK to process user inputs and generate responses. Tools will enable the AI to perform specific tasks by calling backend functions.

5.1 Tools
The following tools will be defined:

check_availability: Retrieves available appointment slots for a given date and dentist.
Input: Date (string, YYYY-MM-DD), Dentist ID (optional, hardcoded for POC).
Output: Array of available time slots (e.g., ["10:00", "10:30"]).
book_appointment: Books an appointment for a patient at a specified date and time.
Input: Patient name, date, time, dentist ID (optional).
Output: Confirmation or error message.
5.2 AI Interaction Flow
The AI receives the conversation history and a list of available tools.
Based on the user’s message, the AI decides whether to respond directly or call a tool.
If a tool is called, the backend executes the corresponding function and returns the result to the AI.
The AI incorporates the tool’s result into the conversation, generating a response for the user.
6. Conversational Flow
The chatbot will guide users through the appointment scheduling process using a conversational interface. Below is an example flow for scheduling an appointment:

User: "I need to book a dental appointment."
Chatbot: "Sure! Please provide your name."
User: "John Doe."
Chatbot: "Thank you, John. What type of appointment would you like? (e.g., Check-up, Cleaning)"
User: "Cleaning."
Chatbot: "Great! What date would you prefer?"
User: "Next Monday."
Chatbot: "Let me check availability for next Monday."
AI calls check_availability tool.
Chatbot: "Available slots: 10:00 AM, 11:00 AM, 2:00 PM. Which would you prefer?"
User: "2:00 PM."
Chatbot: "Please confirm: Appointment for Cleaning on [date] at 2:00 PM."
User: "Yes."
Chatbot: "Your appointment has been booked successfully."
AI calls book_appointment tool.
Error Handling Example:

If the requested slot is unavailable:
Chatbot: "I’m sorry, 2:00 PM is not available. Would you like to choose another time?"
7. Generative UI for Selectable Options
To enhance user interaction, the chatbot will use generative UI to present selectable options (e.g., appointment types, available slots) as interactive components.

7.1 Tools for Generative UI
get_appointment_types: Retrieves a list of available appointment types.
get_available_slots: Retrieves available time slots for a given date.

7.2 UI Components
Appointment Type Selector: Displays buttons for each appointment type (e.g., "Check-up," "Cleaning").
Time Slot Selector: Displays buttons for available time slots (e.g., "10:00 AM," "11:00 AM").
7.3 Interaction Flow
The AI calls a tool (e.g., get_appointment_types) based on the conversation context.
The tool returns data (e.g., list of appointment types).
The frontend renders a corresponding UI component (e.g., Appointment Type Selector).
The user selects an option, which is sent back to the chatbot as a new message.
The AI continues the conversation based on the user’s selection.

8. Security Considerations
Even for a POC, basic security measures should be considered:

Data Validation: Ensure that user inputs are validated before processing.
API Security: Protect API routes from unauthorized access (e.g., using authentication tokens).
Sensitive Data: Avoid storing or displaying sensitive information unnecessarily.

9. Development Steps
The following steps outline the development process for the POC:

Set Up Next.js Project: Initialize a new Next.js application.
Configure SuperBase: Set up a SuperBase project and define the database schema.
Implement Backend Functions: Create functions for checking availability and booking appointments.
Integrate AI SDK: Set up the OpenAI API via the AI SDK and define tools.
Develop Chat Interface: Build the frontend chat interface with React components.
Implement Generative UI: Create UI components for selectable options and integrate them into the chat.
Test the System: Validate the chatbot’s functionality with various scheduling scenarios.
Refine Based on Feedback: Adjust the AI prompts or logic to improve accuracy and user experience.

10. Future Considerations
A successful POC can be expanded with the following features:

Advanced AI Capabilities: Improve intent recognition and support more complex queries.
EHR/CRM Integrations: Connect to existing systems for seamless data management.
Multi-Clinic Support: Extend the system to handle appointments across multiple dental clinics.
User Authentication: Implement secure login for patients and staff.
Notifications: Add reminders via email or SMS for upcoming appointments.