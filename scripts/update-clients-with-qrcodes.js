/**
 * One-time migration script to update existing clients with QR codes
 * 
 * This script should be run only once to generate QR codes for all existing clients
 * in the database. After this, all new clients will automatically get QR codes upon
 * creation through the normal client creation flow.
 * 
 * Usage:
 * 1. Start the development server: npm run dev
 * 2. In a separate terminal, run: node scripts/update-clients-with-qrcodes.js
 */

async function updateClientsWithQRCodes() {
  try {
    console.log('🔄 Updating existing clients with QR codes...');
    
    // Make the API request to our endpoint
    const response = await fetch('http://localhost:3000/api/clients/generate-qrcodes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    
    console.log('✅ QR code generation complete!');
    console.log('📊 Results:');
    console.log(`   Total clients: ${result.stats.total}`);
    console.log(`   QR codes generated: ${result.stats.updated}`);
    console.log(`   Clients already had QR codes: ${result.stats.skipped}`);
    
  } catch (error) {
    console.error('❌ Error updating clients with QR codes:', error);
    process.exit(1);
  }
}

// Run the update
updateClientsWithQRCodes();
