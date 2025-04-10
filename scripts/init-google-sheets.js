#!/usr/bin/env node

/**
 * This script initializes the Google Sheets database structure for the SwimFit app
 * It creates the necessary sheets with the proper headers if they don't already exist
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Import the initialization functions
const { initClientSheet } = require('../lib/client-service');
const { initSessionSheet } = require('../lib/session-service');
const { initAttendanceSheet } = require('../lib/attendance-service');

async function initializeSheets() {
  try {
    console.log('🔄 Initializing Google Sheets database structure...');
    
    console.log('📋 Creating clients sheet...');
    await initClientSheet();
    
    console.log('📅 Creating sessions sheet...');
    await initSessionSheet();
    
    console.log('✅ Creating attendance sheet...');
    await initAttendanceSheet();
    
    console.log('✨ All sheets initialized successfully!');
    console.log(`🔗 Your Google Sheet ID: ${process.env.GOOGLE_SHEET_ID}`);
    console.log('🚀 SwimFit app is now ready to use with Google Sheets!');
  } catch (error) {
    console.error('❌ Error initializing Google Sheets:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeSheets();
