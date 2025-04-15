import supabase from './supabase';

// The SQL schema below represents what needs to be created in Supabase
// These SQL statements are for documentation purposes only and should be executed
// in the Supabase dashboard or CLI

/*
-- Create Patients table
CREATE TABLE patients (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT
);

-- Create Dentists table
CREATE TABLE dentists (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  specialization TEXT NOT NULL
);

-- Create Appointments table
CREATE TABLE appointments (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id) NOT NULL,
  dentist_id INTEGER REFERENCES dentists(id) NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('booked', 'cancelled'))
);

-- Insert the default dentist (Dr. Smith)
INSERT INTO dentists (id, name, specialization)
VALUES (1, 'Dr. Smith', 'General Dentistry');
*/

// Function to check availability for a specific date and dentist
export async function check_availability(
  date: string, // Format: YYYY-MM-DD
  dentist_id: string = '1' // Default to Dr. Smith for POC
) {
  // Generate all possible slots from 9:00 to 17:00 in 30-minute intervals
  const allSlots = [];
  for (let hour = 9; hour <= 17; hour++) {
    for (let minute of [0, 30]) {
      if (hour === 17 && minute === 30) continue; // Skip 17:30 as clinic closes at 17:00
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      allSlots.push(timeString);
    }
  }

  // Query booked slots for the given date and dentist
  const { data: bookedAppointments, error } = await supabase
    .from('appointments')
    .select('time')
    .eq('date', date)
    .eq('dentist_id', parseInt(dentist_id))
    .eq('status', 'booked');

  if (error) {
    console.error('Error checking availability:', error);
    throw new Error('Failed to check availability');
  }

  // Extract booked time slots
  const bookedSlots = bookedAppointments.map(app => app.time.slice(0, 5)); // Format HH:MM

  // Return available slots (all slots minus booked ones)
  return allSlots.filter(slot => !bookedSlots.includes(slot));
}

// This is a placeholder for the book_appointment function to be implemented in Step 4
export async function book_appointment(
  patient_name: string,
  date: string,
  time: string,
  dentist_id: string = '1'
) {
  // This will be implemented in Step 4
  return 'This function will be implemented in Step 4';
}

// This is a placeholder for the reschedule_appointment function to be implemented in Step 5
export async function reschedule_appointment(
  patient_name: string,
  original_date: string,
  original_time: string,
  new_date: string,
  new_time: string
) {
  // This will be implemented in Step 5
  return 'This function will be implemented in Step 5';
}

// This is a basic test function to verify the database connection and query the dentist
export async function testDatabaseConnection() {
  const { data, error } = await supabase
    .from('dentists')
    .select('*')
    .eq('id', 1)
    .single();

  if (error) {
    console.error('Database connection test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }

  return {
    success: true,
    data
  };
} 