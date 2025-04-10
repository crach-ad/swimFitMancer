import { createSheet } from './google-sheets';
import { initClientSheet } from './client-service';
import { initSessionSheet } from './session-service';
import { initAttendanceSheet } from './attendance-service';

/**
 * Initialize all required sheets in the Google Spreadsheet
 * This should be run once to set up the database structure
 */
export async function initializeAllSheets(): Promise<void> {
  try {
    console.log('Initializing client sheet...');
    await initClientSheet();
    
    console.log('Initializing session sheet...');
    await initSessionSheet();
    
    console.log('Initializing attendance sheet...');
    await initAttendanceSheet();
    
    console.log('All sheets initialized successfully!');
  } catch (error) {
    console.error('Error initializing sheets:', error);
    throw error;
  }
}

// Run this function when imported directly
if (require.main === module) {
  initializeAllSheets()
    .then(() => {
      console.log('Google Sheets database setup complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to initialize Google Sheets database:', error);
      process.exit(1);
    });
}
