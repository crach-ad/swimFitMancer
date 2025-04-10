import { NextResponse } from 'next/server';
import { addClient, initClientSheet } from '@/lib/client-service';
// QR code generation is handled within the client service, no need to import here

export async function POST(request: Request) {
  try {
    // Initialize the clients sheet if it doesn't exist
    await initClientSheet();
    
    // Parse the request body
    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }
    
    // Add the client
    const client = await addClient({
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      registrationDate: new Date().toISOString(),
      isActive: data.isActive !== undefined ? data.isActive : true,
      notes: data.notes || ''
    });
    
    return NextResponse.json({ success: true, client });
  } catch (error) {
    console.error('Error adding client:', error);
    return NextResponse.json(
      { error: 'Failed to add client' },
      { status: 500 }
    );
  }
}
