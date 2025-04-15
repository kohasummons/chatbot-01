import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function GET() {
  try {
    // First, check if we already have a patient with name "Test Patient"
    const { data: existingPatient, error: patientError } = await supabase
      .from('patients')
      .select('id')
      .eq('name', 'Test Patient')
      .maybeSingle();

    if (patientError) {
      throw new Error(`Error checking for existing patient: ${patientError.message}`);
    }

    let patient_id;
    
    // If patient doesn't exist, create one
    if (!existingPatient) {
      const { data: newPatient, error: insertPatientError } = await supabase
        .from('patients')
        .insert({ name: 'Test Patient', email: 'test@example.com', phone: '123-456-7890' })
        .select('id')
        .single();
      
      if (insertPatientError) {
        throw new Error(`Error inserting patient: ${insertPatientError.message}`);
      }
      
      patient_id = newPatient.id;
    } else {
      patient_id = existingPatient.id;
    }

    // Now, insert test appointments for 09:00 and 10:00 if they don't already exist
    const testDate = '2023-11-01';
    const testSlots = ['09:00', '10:00'];
    const results = [];

    for (const time of testSlots) {
      // Check if appointment already exists
      const { data: existingAppointment, error: appointmentError } = await supabase
        .from('appointments')
        .select('id')
        .eq('date', testDate)
        .eq('time', time)
        .eq('dentist_id', 1)
        .maybeSingle();

      if (appointmentError) {
        throw new Error(`Error checking for existing appointment at ${time}: ${appointmentError.message}`);
      }

      // If appointment doesn't exist, create it
      if (!existingAppointment) {
        const { data, error: insertError } = await supabase
          .from('appointments')
          .insert({
            patient_id,
            dentist_id: 1,
            date: testDate,
            time,
            status: 'booked'
          })
          .select('id, date, time')
          .single();

        if (insertError) {
          throw new Error(`Error inserting appointment at ${time}: ${insertError.message}`);
        }

        results.push({ action: 'inserted', time, id: data.id });
      } else {
        results.push({ action: 'already exists', time, id: existingAppointment.id });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Test appointments have been created/verified',
      patient_id,
      results
    });
  } catch (error) {
    console.error('Error inserting test appointments:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 