import { NextResponse } from 'next/server';
import { add } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, startTime, endTime } = body;
    
    if (!name || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const session = await add('sessions', { 
      id: `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name, 
      startTime, 
      endTime,
      createdAt: new Date().toISOString() 
    });
    
    return NextResponse.json(
      { success: true, session },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating test session:', error);
    return NextResponse.json(
      { error: 'Failed to create test session' },
      { status: 500 }
    );
  }
}