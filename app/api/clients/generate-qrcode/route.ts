import { NextResponse } from 'next/server';
import { getClientById, updateClient } from '@/lib/client-service';
import { generateQRCode, generateClientQRData } from '@/lib/qrcode-service';

/**
 * API endpoint to generate a QR code for a specific client
 * 
 * @param request The incoming request
 * @returns A response containing the generated QR code or an error
 */
export async function POST(request: Request) {
  try {
    // Get the client ID from the URL query parameter
    const url = new URL(request.url);
    const clientId = url.searchParams.get('clientId');
    
    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      );
    }
    
    // Get the client
    const client = await getClientById(clientId);
    
    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }
    
    // Skip if client already has a QR code
    if (client.qrCode) {
      return NextResponse.json({
        success: true,
        message: 'Client already has a QR code',
        qrCode: client.qrCode
      });
    }
    
    // Generate QR code
    const qrData = generateClientQRData(clientId);
    const qrCode = await generateQRCode(qrData);
    
    // Update client with QR code
    await updateClient(clientId, { qrCode });
    
    return NextResponse.json({
      success: true,
      message: 'QR code generated successfully',
      qrCode
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    return NextResponse.json(
      { error: 'Failed to generate QR code' },
      { status: 500 }
    );
  }
}
