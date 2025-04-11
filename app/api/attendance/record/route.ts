import { NextResponse } from 'next/server';
import { recordAttendance } from '@/lib/attendance-service';

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { clientId, sessionId, notes, timestamp } = body;
    
    console.log('Attendance API received request:', { clientId, sessionId, notesLength: notes?.length || 0 });
    
    // Validate input
    if (!clientId || !sessionId) {
      console.error('Missing required fields:', { clientId, sessionId });
      return NextResponse.json(
        { error: 'Client ID and Session ID are required' },
        { status: 400 }
      );
    }
    
    // Record attendance using the service function
    console.log('Calling recordAttendance with:', { clientId, sessionId, notes: notes || '', timestamp });
    const record = await recordAttendance(clientId, sessionId, notes || '', timestamp);
    console.log('Record attendance result:', record);
    
    if (!record) {
      console.error('recordAttendance returned null');
      return NextResponse.json(
        { error: 'Failed to record attendance' },
        { status: 500 }
      );
    }
    
    // Return success response
    console.log('Successfully recorded attendance for client:', clientId);
    return NextResponse.json(
      { 
        success: true, 
        message: 'Attendance recorded successfully',
        record
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error recording attendance:', error);
    return NextResponse.json(
      { 
        error: 'Failed to record attendance', 
        message: error instanceof Error ? error.message : 'An unknown error occurred' 
      },
      { status: 500 }
    );
  }
}
