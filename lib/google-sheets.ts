import { google } from 'googleapis';
import type { sheets_v4 } from 'googleapis';

// Initialize the sheets client
export function getSheetsClient(): sheets_v4.Sheets {
  try {
    console.log('Initializing Google Sheets client');
    
    // Get credentials from environment variable
    const credentialsStr = process.env.GOOGLE_CREDENTIALS;
    if (!credentialsStr) {
      throw new Error('GOOGLE_CREDENTIALS environment variable is not set');
    }
    
    // Parse the credentials, handling any escaped newlines
    let credentials;
    try {
      credentials = JSON.parse(credentialsStr);
      console.log('Successfully parsed credentials JSON');
    } catch (parseError) {
      console.error('Failed to parse credentials JSON:', parseError);
      throw new Error('Invalid GOOGLE_CREDENTIALS format');
    }
    
    // Check for required credential fields
    if (!credentials.client_email || !credentials.private_key) {
      console.error('Missing required credential fields:', 
        { hasEmail: !!credentials.client_email, hasKey: !!credentials.private_key });
      throw new Error('Missing required credential fields');
    }
    
    // Ensure private_key has proper newlines (common issue)
    const privateKey = credentials.private_key.replace(/\\n/g, '\n');
    
    // Create a new JWT client using the service account credentials
    const auth = new google.auth.JWT(
      credentials.client_email,
      undefined,
      privateKey,
      ['https://www.googleapis.com/auth/spreadsheets']
    );
    
    console.log('Successfully initialized Google Sheets auth client');
    
    // Return the Google Sheets client
    return google.sheets({ version: 'v4', auth });
  } catch (error) {
    console.error('Error initializing Google Sheets client:', error);
    throw new Error(`Failed to initialize Google Sheets client: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper function to get sheet data
export async function getSheetData(
  sheetName: string,
  range: string = 'A:Z'
): Promise<any[]> {
  try {
    const sheets = getSheetsClient();
    const sheetId = process.env.GOOGLE_SHEET_ID;
    
    if (!sheetId) {
      throw new Error('GOOGLE_SHEET_ID environment variable is not set');
    }
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${sheetName}!${range}`,
    });
    
    const rows = response.data.values || [];
    
    // If we have rows, assume the first row contains headers
    if (rows.length > 0) {
      const headers = rows[0];
      // Convert rows to objects with keys from headers
      return rows.slice(1).map(row => {
        return headers.reduce((obj: any, header: string, index: number) => {
          obj[header] = row[index] || null;
          return obj;
        }, {});
      });
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    throw error;
  }
}

// Function to append data to a sheet
export async function appendToSheet(
  sheetName: string,
  values: any[][]
): Promise<void> {
  try {
    console.log(`Appending data to sheet: ${sheetName}`, values);
    
    // Get the sheets client
    const sheets = getSheetsClient();
    
    // Get the sheet ID from environment
    const sheetId = process.env.GOOGLE_SHEET_ID;
    if (!sheetId) {
      console.error('GOOGLE_SHEET_ID environment variable is not set');
      throw new Error('GOOGLE_SHEET_ID environment variable is not set');
    }
    
    console.log(`Using spreadsheet ID: ${sheetId}`);
    
    // Append the values to the sheet
    const appendResponse = await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: `${sheetName}!A:Z`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values,
      },
    });
    
    // Log success
    console.log(`Successfully appended ${values.length} rows to ${sheetName}`, {
      updatedRange: appendResponse.data.updates?.updatedRange,
      updatedRows: appendResponse.data.updates?.updatedRows
    });
    
  } catch (error) {
    console.error(`Error appending to sheet ${sheetName}:`, error);
    throw new Error(`Failed to append to sheet ${sheetName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Function to update a specific row in a sheet
export async function updateSheetRow(
  sheetName: string,
  rowIndex: number,
  values: any[]
): Promise<void> {
  try {
    const sheets = getSheetsClient();
    const sheetId = process.env.GOOGLE_SHEET_ID;
    
    if (!sheetId) {
      throw new Error('GOOGLE_SHEET_ID environment variable is not set');
    }
    
    // Get the header row to maintain correct column mappings
    const headerResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${sheetName}!A1:Z1`,
    });
    
    const headers = headerResponse.data.values?.[0] || [];
    
    // Ensure the values array aligns with headers
    const alignedValues = headers.map((header, index) => values[index] || '');
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `${sheetName}!A${rowIndex + 1}:${String.fromCharCode(65 + headers.length - 1)}${rowIndex + 1}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [alignedValues],
      },
    });
  } catch (error) {
    console.error('Error updating sheet row:', error);
    throw error;
  }
}

// Function to create a new sheet
export async function createSheet(sheetName: string, headers: string[]): Promise<void> {
  try {
    const sheets = getSheetsClient();
    const sheetId = process.env.GOOGLE_SHEET_ID;
    
    if (!sheetId) {
      throw new Error('GOOGLE_SHEET_ID environment variable is not set');
    }
    
    // Check if the sheet already exists
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: sheetId,
    });
    
    const existingSheets = spreadsheet.data.sheets || [];
    const sheetExists = existingSheets.some(
      sheet => sheet.properties?.title === sheetName
    );
    
    if (!sheetExists) {
      // Create a new sheet
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: sheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: sheetName,
                },
              },
            },
          ],
        },
      });
    }
    
    // Add headers to the sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `${sheetName}!A1:${String.fromCharCode(65 + headers.length - 1)}1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [headers],
      },
    });
  } catch (error) {
    console.error('Error creating sheet:', error);
    throw error;
  }
}
