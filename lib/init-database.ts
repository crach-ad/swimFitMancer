// Firebase database initialization
import { initClientSheet } from './client-service';
import { initSessionSheet } from './session-service';
import { initAttendanceSheet } from './attendance-service';
import './firebase/config'; // Ensure Firebase is initialized

/**
 * Initialize all required collections in Firebase Firestore
 * This ensures collection references are ready to use
 */
export async function initializeAllCollections(): Promise<void> {
  try {
    console.log('Initializing Firebase client collection...');
    await initClientSheet();
    
    console.log('Initializing Firebase session collection...');
    await initSessionSheet();
    
    console.log('Initializing Firebase attendance collection...');
    await initAttendanceSheet();
    
    console.log('All Firebase collections initialized successfully!');
  } catch (error) {
    console.error('Error initializing Firebase collections:', error);
    throw error;
  }
}

// Run this function when imported directly
if (require.main === module) {
  initializeAllCollections()
    .then(() => {
      console.log('Firebase database setup complete!');
      process.exit(0);
    })
    .catch((error: unknown) => {
      console.error('Failed to initialize Firebase database:', error);
      process.exit(1);
    });
}
