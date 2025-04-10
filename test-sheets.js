// Test script to check Google Sheets connection using CommonJS
require('dotenv').config({ path: '.env.local' });
const { google } = require('googleapis');

// Get credentials from environment
const credentialsStr = process.env.GOOGLE_CREDENTIALS;
const sheetId = process.env.GOOGLE_SHEET_ID;

if (!credentialsStr) {
  console.error('GOOGLE_CREDENTIALS not found in environment variables');
  process.exit(1);
}

if (!sheetId) {
  console.error('GOOGLE_SHEET_ID not found in environment variables');
  process.exit(1);
}

console.log('Google Sheet ID:', sheetId);

// Parse credentials
let credentials;
try {
  credentials = JSON.parse(credentialsStr);
  console.log('Successfully parsed credentials JSON');
} catch (parseError) {
  console.error('Failed to parse credentials JSON:', parseError);
  process.exit(1);
}

// Log important parts of credentials to debug
console.log('Credential client_email:', credentials.client_email);
console.log('Private key starts with:', credentials.private_key.substring(0, 20) + '...');

// Create auth client
const auth = new google.auth.JWT(
  credentials.client_email,
  undefined,
  credentials.private_key.replace(/\\n/g, '\n'),
  ['https://www.googleapis.com/auth/spreadsheets']
);

// Create sheets client
const sheets = google.sheets({ version: 'v4', auth });

// Test function
async function testGoogleSheetsConnection() {
  try {
    console.log('Testing Google Sheets connection...');
    
    // Test sheet access first
    console.log('Testing sheet access...');
    const response = await sheets.spreadsheets.get({
      spreadsheetId: sheetId
    });
    
    console.log('Successfully accessed sheet:', response.data.properties?.title);
    
    // Initialize test sheet
    const SHEET_NAME = 'test_sheet';
    const HEADERS = ['id', 'name', 'timestamp', 'notes'];
    
    console.log(`Creating/checking test sheet: ${SHEET_NAME}`);
    
    // Check if sheet exists first
    try {
      await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `${SHEET_NAME}!A1:A1`
      });
      console.log(`${SHEET_NAME} already exists`);
    } catch (error) {
      // Sheet doesn't exist, create it
      console.log(`Creating new sheet: ${SHEET_NAME}`);
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: sheetId,
        requestBody: {
          requests: [{
            addSheet: {
              properties: {
                title: SHEET_NAME
              }
            }
          }]
        }
      });
      
      // Add headers
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `${SHEET_NAME}!A1:D1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [HEADERS]
        }
      });
      console.log('Headers added to new sheet');
    }
    
    // Add test record
    console.log('Adding test record...');
    const testRecord = [
      `test_${Date.now()}`,
      'Test User',
      new Date().toISOString(),
      'Test note from direct script'
    ];
    
    const appendResult = await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: `${SHEET_NAME}!A:D`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [testRecord]
      }
    });
    
    console.log('Test record added successfully!', {
      updatedRange: appendResult.data.updates?.updatedRange,
      updatedRows: appendResult.data.updates?.updatedRows
    });
    
  } catch (error) {
    console.error('Error testing Google Sheets connection:', error);
  }
}

// Run the test
testGoogleSheetsConnection();
