import { NextResponse } from 'next/server';
import { book_appointment } from '@/lib/appointmentFunctions';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const patient_name = url.searchParams.get('patient_name') || 'Jane Doe';
  const patient_email = url.searchParams.get('patient_email') || '';
  const date = url.searchParams.get('date') || '2023-11-01';
  const time = url.searchParams.get('time') || '11:00';
  const dentist_id = url.searchParams.get('dentist_id') || '1';
  
  try {
    const result = await book_appointment(patient_name, date, time, dentist_id, patient_email);
    return NextResponse.json({ success: true, message: result });
  } catch (error) {
    console.error('Error booking appointment:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 