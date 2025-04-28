import { getAll, update } from '../firebase/db';
import { Client } from '../client-service';

/**
 * Utility function to clean up any "Sessions attended" text from client notes
 * and ensure sessionCount is the only source of truth for package usage
 */
export async function cleanupClientNotes() {
  try {
    console.log('Starting client notes cleanup...');
    
    // Get all clients
    const clients = await getAll<Client>('clients');
    console.log(`Found ${clients.length} clients to process`);
    
    // Track changes
    let updatedCount = 0;
    
    // Process each client
    for (const client of clients) {
      // Check if client notes contain "Sessions attended" text
      if (client.notes && client.notes.includes('Sessions attended:')) {
        console.log(`Cleaning notes for client: ${client.name}`);
        
        // Clean up the notes
        let cleanNotes = client.notes.replace(/\s*\|?\s*Sessions attended: \d+/, '');
        
        // Remove any trailing or leading separators
        cleanNotes = cleanNotes.replace(/^\s*\|\s*/, '').replace(/\s*\|\s*$/, '');
        
        // Remove notes entirely if they're now empty
        if (!cleanNotes.trim()) {
          cleanNotes = '';
        }
        
        // Update the client record with clean notes
        await update<Partial<Client>>('clients', client.id, {
          notes: cleanNotes
        });
        
        updatedCount++;
      }
    }
    
    console.log(`Notes cleanup completed. Updated ${updatedCount} client records.`);
    return { success: true, updatedCount };
  } catch (error) {
    console.error('Error during notes cleanup:', error);
    return { success: false, error };
  }
}
