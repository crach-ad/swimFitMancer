import { NextResponse } from 'next/server';
import { addSession, initSessionSheet } from '@/lib/session-service';

export async function POST(request: Request) {
  try {
    // Initialize the sessions sheet if it doesn't exist
    await initSessionSheet();
    
    // Parse the request body
    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.startTime || !data.endTime || !data.location) {
      return NextResponse.json(
        { error: 'Name, start time, end time, and location are required' },
        { status: 400 }
      );
    }
    
    // Add the session
    const session = await addSession({
      name: data.name,
      startTime: data.startTime,
      endTime: data.endTime,
      location: data.location,
      level: data.level || 'All Levels',
      maxAttendees: parseInt(data.maxAttendees) || 20,
      description: data.description || '',
      isRecurring: data.isRecurring || false,
      recurringDays: data.recurringDays ? JSON.stringify(data.recurringDays) : '[]'
    });
    
    return NextResponse.json({ success: true, session });
  } catch (error) {
    console.error('Error adding session:', error);
    return NextResponse.json(
      { error: 'Failed to add session' },
      { status: 500 }
    );
  }
}
