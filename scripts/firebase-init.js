/**
 * Firebase Initialization Script
 * 
 * This script can be used during initial deployment to set up Firebase collections
 * and initialize any required resources. It imports the initialization process
 * from our regular application code to ensure consistency.
 * 
 * Usage: node scripts/firebase-init.js
 */

// Set environment to production for safety
process.env.NODE_ENV = 'production';

// Dynamically import our initialization code
async function initializeFirebase() {
  try {
    console.log('Starting Firebase initialization...');
    
    // Import our database initialization function
    const { initializeAllCollections } = await import('../lib/init-database.js');
    
    // Initialize all collections
    await initializeAllCollections();
    
    console.log('Firebase initialization completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Firebase initialization failed:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeFirebase();
