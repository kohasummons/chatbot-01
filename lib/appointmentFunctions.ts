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
  try {
    // Step 1: Check if the slot is available
    const availableSlots = await check_availability(date, dentist_id);
    
    if (!availableSlots.includes(time)) {
      return "Slot is already booked.";
    }
    
    // Step 2: Check if the patient exists
    const { data: existingPatient, error: patientError } = await supabase
      .from('patients')
      .select('id')
      .eq('name', patient_name)
      .maybeSingle();
      
    if (patientError) {
      console.error('Error checking for existing patient:', patientError);
      throw new Error(`Failed to check for existing patient: ${patientError.message}`);
    }
    
    let patient_id;
    
    // Step 3: If patient doesn't exist, create a new one
    if (!existingPatient) {
      // First get the maximum patient ID to avoid primary key conflicts
      const { data: maxIdData, error: maxIdError } = await supabase
        .from('patients')
        .select('id')
        .order('id', { ascending: false })
        .limit(1)
        .single();
        
      if (maxIdError && !maxIdError.message.includes('No rows found')) {
        console.error('Error getting max patient ID:', maxIdError);
        throw new Error(`Failed to get max patient ID: ${maxIdError.message}`);
      }
      
      const nextId = maxIdData ? maxIdData.id + 1 : 1;
      
      const { data: newPatient, error: createPatientError } = await supabase
        .from('patients')
        .insert({ 
          id: nextId,
          name: patient_name, 
          email: '', 
          phone: '' 
        })
        .select('id')
        .single();
        
      if (createPatientError) {
        console.error('Error creating new patient:', createPatientError);
        throw new Error(`Failed to create new patient: ${createPatientError.message}`);
      }
      
      patient_id = newPatient.id;
    } else {
      patient_id = existingPatient.id;
    }
    
    // Step 4: Insert the new appointment
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .insert({
        patient_id,
        dentist_id: parseInt(dentist_id),
        date,
        time,
        status: 'booked'
      })
      .select('id, date, time')
      .single();
      
    if (appointmentError) {
      console.error('Error booking appointment:', appointmentError);
      throw new Error(`Failed to book appointment: ${appointmentError.message}`);
    }
    
    return "Appointment booked successfully.";
  } catch (error) {
    console.error('Unexpected error in book_appointment:', error);
    throw error;
  }
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