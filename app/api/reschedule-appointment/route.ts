import { reschedule_appointment } from '@/lib/appointmentFunctions';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  // Get parameters from query string
  const patient_name = searchParams.get('patient_name') || 'Jane Doe';
  const patient_email = searchParams.get('patient_email') || '';
  const original_date = searchParams.get('original_date') || '2023-11-01';
  const original_time = searchParams.get('original_time') || '11:00';
  const new_date = searchParams.get('new_date') || '2023-11-01';
  const new_time = searchParams.get('new_time') || '12:00';
  const dentist_id = searchParams.get('dentist_id') || '1';
  
  try {
    const result = await reschedule_appointment(
      patient_name,
      original_date,
      original_time,
      new_date,
      new_time,
      dentist_id,
      patient_email
    );
    
    return NextResponse.json({ message: result });
  } catch (error: any) {
    console.error('Error in reschedule-appointment API:', error);
    return NextResponse.json(
      { error: 'Failed to reschedule appointment', details: error.message },
      { status: 500 }
    );
  }
} 