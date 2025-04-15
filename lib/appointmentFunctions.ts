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
    for (const minute of [0, 30]) {
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

// Function to check if a patient email already has any active (booked) appointments
export async function check_existing_appointments(patient_email: string) {
  if (!patient_email) {
    return { hasAppointment: false, appointments: [] };
  }

  try {
    // Get all patients with this email (could be multiple)
    const { data: patients, error: patientError } = await supabase
      .from('patients')
      .select('id')
      .eq('email', patient_email);
      
    if (patientError) {
      console.error('Error checking for patient:', patientError);
      throw new Error(`Failed to check for patient: ${patientError.message}`);
    }
    
    // If no patients found with this email, they have no appointments
    if (!patients || patients.length === 0) {
      return { hasAppointment: false, appointments: [] };
    }
    
    // Get all patient IDs
    const patientIds = patients.map(patient => patient.id);
    
    // Check for any active appointments for these patients
    const { data: appointments, error: appointmentError } = await supabase
      .from('appointments')
      .select('id, date, time, dentist_id')
      .in('patient_id', patientIds)
      .eq('status', 'booked');
      
    if (appointmentError) {
      console.error('Error checking for existing appointments:', appointmentError);
      throw new Error(`Failed to check for existing appointments: ${appointmentError.message}`);
    }
    
    return { 
      hasAppointment: appointments && appointments.length > 0, 
      appointments: appointments || [] 
    };
  } catch (error) {
    console.error('Unexpected error in check_existing_appointments:', error);
    throw error;
  }
}

// This is a placeholder for the book_appointment function to be implemented in Step 4
export async function book_appointment(
  patient_name: string,
  date: string,
  time: string,
  dentist_id: string = '1',
  patient_email: string = ''
) {
  try {
    // Step 1: If email is provided, check if patient already has existing appointments
    if (patient_email) {
      const { hasAppointment, appointments } = await check_existing_appointments(patient_email);
      
      if (hasAppointment) {
        // Format appointments for display
        const formattedAppointments = appointments.map(app => 
          `${app.date} at ${app.time}`
        ).join(', ');
        
        return `You already have active appointment(s) scheduled: ${formattedAppointments}. Please reschedule or cancel existing appointments before booking a new one.`;
      }
    }
    
    // Step 2: Check if the slot is available
    const availableSlots = await check_availability(date, dentist_id);
    
    if (!availableSlots.includes(time)) {
      return "Slot is already booked.";
    }
    
    // Step 3: Check if the patient exists
    let patientQuery = supabase
      .from('patients')
      .select('id')
      .eq('name', patient_name);
    
    // Add email check if provided
    if (patient_email) {
      patientQuery = patientQuery.eq('email', patient_email);
    }
    
    const { data: existingPatient, error: patientError } = await patientQuery.maybeSingle();
      
    if (patientError) {
      console.error('Error checking for existing patient:', patientError);
      throw new Error(`Failed to check for existing patient: ${patientError.message}`);
    }
    
    let patient_id;
    
    // Step 4: If patient doesn't exist, create a new one
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
          email: patient_email || '', 
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
    
    // Step 5: Insert the new appointment
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

// Function to reschedule an appointment using patient email
export async function reschedule_appointment(
  patient_name: string,
  new_date: string,
  new_time: string,
  dentist_id: string = '1',
  patient_email: string = '',
  appointment_id?: number,
  original_date?: string,
  original_time?: string
) {
  try {
    if (!patient_email && !appointment_id && (!original_date || !original_time)) {
      return "Email is required to reschedule an appointment.";
    }
    
    // If we have a specific appointment ID, use that
    if (appointment_id) {
      // Check if the appointment exists
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .select('id, date, time, patient_id')
        .eq('id', appointment_id)
        .eq('status', 'booked')
        .single();
        
      if (appointmentError || !appointment) {
        return "Appointment not found with the provided ID.";
      }
      
      // Check if the new slot is available
      const availableSlots = await check_availability(new_date, dentist_id);
      if (!availableSlots.includes(new_time)) {
        return "New slot is not available.";
      }
      
      // Update the appointment
      const { data: updatedAppointment, error: updateError } = await supabase
        .from('appointments')
        .update({
          date: new_date,
          time: new_time
        })
        .eq('id', appointment_id)
        .select('id, date, time')
        .single();
        
      if (updateError) {
        console.error('Error rescheduling appointment:', updateError);
        throw new Error(`Failed to reschedule appointment: ${updateError.message}`);
      }
      
      return `Appointment successfully rescheduled to ${new_date} at ${new_time}.`;
    }
    
    // Otherwise, try to find the patient by email
    if (patient_email) {
      // Get all patients with this email
      const { data: patients, error: patientError } = await supabase
        .from('patients')
        .select('id, name')
        .eq('email', patient_email);
        
      if (patientError) {
        console.error('Error finding patient:', patientError);
        throw new Error(`Failed to find patient: ${patientError.message}`);
      }
      
      if (!patients || patients.length === 0) {
        return "No patient found with the provided email.";
      }
      
      // Get all patient IDs
      const patientIds = patients.map(p => p.id);
      
      // Find all appointments for these patients
      let appointmentsQuery = supabase
        .from('appointments')
        .select('id, date, time, dentist_id')
        .in('patient_id', patientIds)
        .eq('status', 'booked');
      
      // If original date and time are provided, use them to filter
      if (original_date && original_time) {
        appointmentsQuery = appointmentsQuery
          .eq('date', original_date)
          .eq('time', original_time);
      }
        
      const { data: appointments, error: appointmentError } = await appointmentsQuery;
        
      if (appointmentError) {
        console.error('Error finding appointments:', appointmentError);
        throw new Error(`Failed to find appointments: ${appointmentError.message}`);
      }
      
      if (!appointments || appointments.length === 0) {
        return original_date && original_time 
          ? `No appointment found for ${original_date} at ${original_time}.`
          : "No active appointments found for this email.";
      }
      
      // If there's exactly one appointment, or we have original date/time to identify it
      if (appointments.length === 1 || (original_date && original_time)) {
        const appointmentToReschedule = appointments[0];
        
        // Skip if the new slot is the same as the original
        if (appointmentToReschedule.date === new_date && appointmentToReschedule.time === new_time) {
          return "New slot is the same as the original slot.";
        }
        
        // Check if the new slot is available
        const availableSlots = await check_availability(new_date, dentist_id);
        if (!availableSlots.includes(new_time)) {
          return "New slot is not available.";
        }
        
        // Update the appointment
        const { data: updatedAppointment, error: updateError } = await supabase
          .from('appointments')
          .update({
            date: new_date,
            time: new_time
          })
          .eq('id', appointmentToReschedule.id)
          .select('id, date, time')
          .single();
          
        if (updateError) {
          console.error('Error rescheduling appointment:', updateError);
          throw new Error(`Failed to reschedule appointment: ${updateError.message}`);
        }
        
        return `Appointment successfully rescheduled from ${appointmentToReschedule.date} at ${appointmentToReschedule.time} to ${new_date} at ${new_time}.`;
      } else {
        // Multiple appointments found, return them so the user can choose
        const formattedAppointments = appointments.map(app => 
          `ID: ${app.id}, Date: ${app.date}, Time: ${app.time}`
        ).join('\n');
        
        return `Multiple appointments found. Please specify which one to reschedule:\n${formattedAppointments}`;
      }
    }
    
    // If we reach here, we didn't have enough information
    return "Unable to identify which appointment to reschedule. Please provide either an appointment ID or patient email.";
  } catch (error) {
    console.error('Unexpected error in reschedule_appointment:', error);
    throw error;
  }
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