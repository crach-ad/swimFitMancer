import { NextResponse } from 'next/server';
import { recordAttendance, getAttendanceRecords, initAttendanceSheet } from '@/lib/attendance-service';
import { getClients } from '@/lib/client-service';
import { getSessions } from '@/lib/session-service';

export async function GET() {
  try {
    // Initialize the attendance sheet if it doesn't exist
    await initAttendanceSheet();
    
    // Get all attendance records, clients, and sessions in parallel
    const [records, clients, sessions] = await Promise.all([
      getAttendanceRecords(),
      getClients(),
      getSessions()
    ]);
    
    // Enhance attendance records with client and session names
    const enhancedRecords = records.map(record => {
      // Find the associated client and session
      const client = clients.find(c => c.id === record.clientId);
      const session = sessions.find(s => s.id === record.sessionId);
      
      return {
        ...record,
        clientName: client?.name || 'Unknown Client',
        sessionName: session?.name || 'Unknown Session'
      };
    });
    
    return NextResponse.json({ records: enhancedRecords });
  } catch (error) {
    console.error('Error in attendance API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attendance records' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Initialize the attendance sheet if it doesn't exist
    await initAttendanceSheet();
    
    // Parse the request body
    const { clientId, sessionId, notes } = await request.json();
    
    // Validate required fields
    if (!clientId || !sessionId) {
      return NextResponse.json(
        { error: 'Client ID and Session ID are required' },
        { status: 400 }
      );
    }
    
    // Record attendance
    const result = await recordAttendance(clientId, sessionId, notes);
    
    if (!result) {
      return NextResponse.json(
        { error: 'Failed to record attendance' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true, record: result });
  } catch (error) {
    console.error('Error recording attendance:', error);
    return NextResponse.json(
      { error: 'Failed to record attendance' },
      { status: 500 }
    );
  }
}
