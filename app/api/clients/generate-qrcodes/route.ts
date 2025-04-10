import { NextResponse } from 'next/server';
import { getClients, updateClient } from '@/lib/client-service';
import { generateQRCode, generateClientQRData } from '@/lib/qrcode-service';

/**
 * API endpoint to generate QR codes for all existing clients that don't have one
 * This is more efficient than running a separate script, and follows the existing pattern
 * of using API routes for data operations.
 */
export async function POST(request: Request) {
  try {
    // Get all clients
    const clients = await getClients();
    
    let updateCount = 0;
    let skipCount = 0;
    
    // Process each client
    for (const client of clients) {
      // Skip clients that already have a QR code
      if (client.qrCode) {
        skipCount++;
        continue;
      }
      
      // Generate QR code
      const qrData = generateClientQRData(client.id);
      const qrCode = await generateQRCode(qrData);
      
      // Update client with QR code
      await updateClient(client.id, { qrCode });
      updateCount++;
    }
    
    return NextResponse.json({
      success: true,
      message: 'QR codes generated successfully',
      stats: {
        total: clients.length,
        updated: updateCount,
        skipped: skipCount
      }
    });
  } catch (error) {
    console.error('Error generating QR codes:', error);
    return NextResponse.json(
      { error: 'Failed to generate QR codes' },
      { status: 500 }
    );
  }
}
