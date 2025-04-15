import { NextResponse } from 'next/server';
import { testDatabaseConnection } from '@/lib/appointmentFunctions';

export async function GET() {
  try {
    const result = await testDatabaseConnection();
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to the database' },
      { status: 500 }
    );
  }
} 