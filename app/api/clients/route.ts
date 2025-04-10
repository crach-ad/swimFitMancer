import { NextResponse } from 'next/server';
import { getClients, initClientSheet } from '@/lib/client-service';

export async function GET() {
  try {
    // Initialize the clients sheet if it doesn't exist
    await initClientSheet();
    
    // Get all clients
    const clients = await getClients();
    
    return NextResponse.json({ clients });
  } catch (error) {
    console.error('Error in clients API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}
