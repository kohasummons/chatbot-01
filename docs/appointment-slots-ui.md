# Appointment Slots UI Implementation

This document explains the implementation of the appointment slots UI feature for the dental clinic chatbot.

## Overview

The appointment slots UI is a generative UI component that displays available appointment times as clickable chips. When a user asks about appointment availability for a specific date, the chatbot will:

1. Use the `checkAppointmentAvailability` tool to fetch available slots
2. Render those slots as interactive chips using the `AppointmentSlots` component
3. Allow the user to select a slot by clicking on it

## Components

### AppointmentSlots Component

Located at `components/AppointmentSlots.tsx`, this reusable component:

- Takes a date and an array of available time slots as props
- Groups slots by hour for better organization
- Formats times for display (e.g., "14:30" becomes "2:30 PM")
- Renders each slot as a clickable chip
- Highlights the selected slot
- Shows a message when no slots are available

### Tool Implementation

The `appointmentAvailabilityTool` in `lib/tools.ts` wraps the existing `check_availability` function from `lib/appointmentFunctions.ts` and converts it into a tool that can be called by the AI.

### API Route Integration

The chat API route in `app/api/chat/route.ts` was updated to include the new tool in its list of available tools.

### Page Component Integration

The main page in `app/page.tsx` was updated to:

- Add state for tracking the selected slot
- Include a helper function to render tool invocation results
- Render the `AppointmentSlots` component when the checkAppointmentAvailability tool returns results
- Handle slot selection and automatically send the selected time to the chat

## Usage

When a user asks about appointment availability (e.g., "What times are available on May 15?"), the chatbot will:

1. Call the `checkAppointmentAvailability` tool
2. Display available slots grouped by AM/PM
3. When the user clicks a slot, it automatically sends that time to the chat
4. The chatbot can then proceed with booking or showing additional information

## Dependencies

This implementation uses:
- The existing `check_availability` function from appointmentFunctions.ts
- React state for managing selection
- Tailwind CSS for styling 