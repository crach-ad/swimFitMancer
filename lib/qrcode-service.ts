import QRCode from 'qrcode';

/**
 * Generate a QR code as a data URL
 * @param data - The data to encode in the QR code
 * @returns A promise that resolves to a data URL containing the QR code
 */
export async function generateQRCode(data: string): Promise<string> {
  try {
    // Generate QR code as data URL
    const dataUrl = await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'M', // Medium error correction level
      margin: 2, // Smaller margin for nicer appearance
      width: 200, // Fixed size for consistency
      color: {
        dark: '#000000', // Black dots
        light: '#ffffff' // White background
      }
    });
    
    return dataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Generate a unique identifier string for client QR codes
 * @param clientId - The client's ID
 * @returns A string that can be encoded in a QR code
 */
export function generateClientQRData(clientId: string): string {
  // Create a structured data string for the QR code
  // Format: swimfit:client:ID
  return `swimfit:client:${clientId}`;
}

/**
 * Extract client ID from QR code data
 * @param qrData - The data scanned from a QR code
 * @returns The client ID or null if the format is invalid
 */
export function extractClientIdFromQR(qrData: string): string | null {
  // Check if the QR code has the expected format
  const prefix = 'swimfit:client:';
  if (qrData.startsWith(prefix)) {
    return qrData.substring(prefix.length);
  }
  return null;
}
