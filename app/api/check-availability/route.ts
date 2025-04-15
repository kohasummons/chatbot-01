import { NextResponse } from 'next/server';
import { check_availability } from '@/lib/appointmentFunctions';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const date = url.searchParams.get('date') || '2023-11-01'; // Default to 2023-11-01 if no date provided
  const dentist_id = url.searchParams.get('dentist_id') || '1'; // Default to Dr. Smith if no dentist_id provided

  try {
    const availableSlots = await check_availability(date, dentist_id);
    return NextResponse.json({ availableSlots });
  } catch (error) {
    console.error('Error checking availability:', error);
    return NextResponse.json(
      { error: 'Failed to check availability' },
      { status: 500 }
    );
  }
} 