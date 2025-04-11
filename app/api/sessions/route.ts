import { NextResponse } from 'next/server';
import { getSessions, initSessionSheet, addSession } from '@/lib/session-service';
import type { Session } from '@/lib/session-service';

export async function GET() {
  try {
    // Initialize the sessions sheet if it doesn't exist
    await initSessionSheet();
    
    // Get all sessions
    const sessions = await getSessions();
    
    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Error in sessions API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Parse the request body
    const sessionData = await request.json();
    
    // Validate the session data
    if (!sessionData.name || !sessionData.startTime || !sessionData.endTime) {
      return NextResponse.json(
        { error: 'Missing required fields: name, startTime, endTime' },
        { status: 400 }
      );
    }
    
    // Ensure dates are valid
    try {
      new Date(sessionData.startTime);
      new Date(sessionData.endTime);
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid date format for startTime or endTime' },
        { status: 400 }
      );
    }
    
    // Make sure maxAttendees is a number
    const maxAttendees = sessionData.maxAttendees ? 
      parseInt(sessionData.maxAttendees.toString()) : 20;
    
    // Prepare the session object
    const session: Omit<Session, 'id'> = {
      name: sessionData.name,
      startTime: sessionData.startTime,
      endTime: sessionData.endTime,
      maxAttendees: maxAttendees,
      description: sessionData.description || '',
      location: sessionData.location || ''
    };
    
    // Add the session to the database
    const newSession = await addSession(session);
    
    return NextResponse.json({ success: true, session: newSession });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create session', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
