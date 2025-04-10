import { NextResponse } from 'next/server';
import { addClient } from '@/lib/client-service';
import { addSession } from '@/lib/session-service';
import { recordAttendance } from '@/lib/attendance-service';

/**
 * API route to add sample data to Google Sheets for testing
 * This is intended for development/testing only
 */
export async function GET() {
  try {
    // Sample clients data
    const clients = await Promise.all([
      addClient({
        name: 'Emma Johnson',
        email: 'emma.johnson@example.com',
        phone: '555-123-4567',
        registrationDate: new Date('2025-01-15').toISOString(),
        isActive: true,
        notes: 'Intermediate swimmer'
      }),
      addClient({
        name: 'Michael Chen',
        email: 'michael.chen@example.com',
        phone: '555-234-5678',
        registrationDate: new Date('2025-02-03').toISOString(),
        isActive: true,
        notes: 'Advanced, training for competition'
      }),
      addClient({
        name: 'Sophia Rodriguez',
        email: 'sophia.r@example.com',
        phone: '555-345-6789',
        registrationDate: new Date('2025-03-20').toISOString(),
        isActive: true,
        notes: 'Beginner, focusing on technique'
      })
    ]);

    // Sample sessions data
    const sessions = await Promise.all([
      addSession({
        name: 'Morning Lap Swim',
        startTime: new Date('2025-04-10T07:00:00').toISOString(),
        endTime: new Date('2025-04-10T08:00:00').toISOString(),
        maxAttendees: 8,
        description: 'Open lap swimming session for all levels',
        location: 'Main Pool'
      }),
      addSession({
        name: 'Beginner Technique',
        startTime: new Date('2025-04-10T09:30:00').toISOString(),
        endTime: new Date('2025-04-10T10:30:00').toISOString(),
        maxAttendees: 10,
        description: 'Technique fundamentals for beginners',
        location: 'Training Pool'
      }),
      addSession({
        name: 'Advanced Training',
        startTime: new Date('2025-04-10T16:00:00').toISOString(),
        endTime: new Date('2025-04-10T17:30:00').toISOString(),
        maxAttendees: 6,
        description: 'High-intensity training for advanced swimmers',
        location: 'Competition Pool'
      })
    ]);

    // Record some sample attendance
    await Promise.all([
      // Emma attends Morning Lap Swim
      recordAttendance(clients[0].id, sessions[0].id, 'Regular attendee'),
      
      // Michael attends Advanced Training
      recordAttendance(clients[1].id, sessions[2].id, 'Preparing for competition'),
      
      // Sophia attends Beginner Technique
      recordAttendance(clients[2].id, sessions[1].id, 'First session')
    ]);

    return NextResponse.json({ 
      success: true,
      message: 'Sample data added successfully!',
      data: {
        clients: clients.map(c => c.name),
        sessions: sessions.map(s => s.name)
      }
    });
  } catch (error) {
    console.error('Error adding sample data:', error);
    return NextResponse.json({ 
      success: false,
      message: 'Failed to add sample data',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
