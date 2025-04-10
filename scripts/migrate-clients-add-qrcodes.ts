/**
 * Migration script to update all existing clients with QR codes
 * This script will fetch all clients from the database, generate QR codes for them,
 * and update their records in the spreadsheet.
 */

import { getClients, updateClient } from '../lib/client-service';
import { generateQRCode, generateClientQRData } from '../lib/qrcode-service';

async function migrateClientsAddQRCodes() {
  console.log('🔄 Starting client QR code migration...');
  
  try {
    // Get all clients
    console.log('📋 Fetching all clients...');
    const clients = await getClients();
    console.log(`✅ Found ${clients.length} clients.`);
    
    // Process each client
    console.log('🔄 Generating QR codes for each client...');
    
    let updateCount = 0;
    let skipCount = 0;
    
    for (const client of clients) {
      // Skip clients that already have a QR code
      if (client.qrCode) {
        console.log(`⏩ Client ${client.name} already has a QR code, skipping.`);
        skipCount++;
        continue;
      }
      
      // Generate QR code
      const qrData = generateClientQRData(client.id);
      const qrCode = await generateQRCode(qrData);
      
      // Update client with QR code
      await updateClient(client.id, { qrCode });
      
      console.log(`✅ Generated and stored QR code for ${client.name} (ID: ${client.id})`);
      updateCount++;
    }
    
    console.log('\n🎉 Migration complete!');
    console.log(`📊 Summary:`);
    console.log(`   - ${clients.length} total clients`);
    console.log(`   - ${updateCount} clients updated with QR codes`);
    console.log(`   - ${skipCount} clients already had QR codes`);
    
  } catch (error) {
    console.error('❌ Error during migration:', error);
    process.exit(1);
  }
}

// Execute the migration
migrateClientsAddQRCodes().catch(console.error);
