import { NextResponse } from 'next/server';
import { initClientSheet } from '@/lib/client-service';
import { initSessionSheet } from '@/lib/session-service';
import { initAttendanceSheet } from '@/lib/attendance-service';

/**
 * API route to initialize Google Sheets database structure
 * This is a one-time setup operation
 */
export async function GET() {
  try {
    // Initialize client sheet
    await initClientSheet();
    
    // Initialize session sheet
    await initSessionSheet();
    
    // Initialize attendance sheet
    await initAttendanceSheet();
    
    return NextResponse.json({ 
      success: true,
      message: 'All Google Sheets initialized successfully!'
    });
  } catch (error) {
    console.error('Error initializing sheets:', error);
    return NextResponse.json({ 
      success: false,
      message: 'Failed to initialize Google Sheets',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
