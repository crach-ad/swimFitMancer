import { NextResponse } from 'next/server';
import { getAttendanceRecords } from '@/lib/attendance-service';
import { getClientById } from '@/lib/client-service';
import { getSessionById } from '@/lib/session-service';

/**
 * API route to get attendance records for a specific session
 */
export async function GET(request: Request) {
  try {
    // Get the session ID from the URL query parameter
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('sessionId');
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }
    
    // Get all attendance records
    const allAttendanceRecords = await getAttendanceRecords();
    
    // Filter attendance records for the specified session
    const sessionAttendance = allAttendanceRecords.filter(
      record => record.sessionId === sessionId
    );
    
    // Enhance records with client details
    const enhancedRecords = await Promise.all(
      sessionAttendance.map(async (record) => {
        // Use the client name from the record if available, or fetch it
        if (record.clientName) {
          return record;
        }
        
        // Otherwise, look up the client to get their name
        const client = await getClientById(record.clientId);
        return {
          ...record,
          clientName: client?.name || 'Unknown Client'
        };
      })
    );
    
    // Get session details
    const session = await getSessionById(sessionId);
    
    return NextResponse.json({
      session,
      attendance: enhancedRecords
    });
  } catch (error) {
    console.error('Error fetching session attendance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session attendance' },
      { status: 500 }
    );
  }
}
