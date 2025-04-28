import { NextResponse } from 'next/server';
import { updateClient } from '@/lib/client-service';

// This is a completely new implementation to resolve Vercel type errors
export async function PATCH(
  request: Request,
  { params }: { params: { id: string }}
) {
  try {
    // Extract client ID from URL parameter
    const clientId = params.id;
    
    // Parse request body for update data
    const data = await request.json();
    
    // Validate incoming data
    if (data.packageLimit !== undefined && 
        (typeof data.packageLimit !== 'number' || data.packageLimit < 1)) {
      return NextResponse.json(
        { error: 'Package limit must be a positive number' },
        { status: 400 }
      );
    }
    
    // Update the client in Firestore
    const updatedClient = await updateClient(clientId, {
      packageLimit: data.packageLimit,
    });
    
    // Return success response
    return NextResponse.json({ 
      message: 'Client updated successfully',
      client: updatedClient 
    });
  } catch (error) {
    console.error('Error updating client:', error);
    
    // Return error response
    return NextResponse.json(
      { error: 'Failed to update client' },
      { status: 500 }
    );
  }
}
