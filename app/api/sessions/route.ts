import { NextResponse } from 'next/server';
import { getSessions, initSessionSheet } from '@/lib/session-service';

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
