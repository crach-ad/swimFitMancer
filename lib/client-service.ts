import { getSheetData, appendToSheet, updateSheetRow, createSheet } from './google-sheets';
import { generateQRCode, generateClientQRData } from './qrcode-service';

// Define Client interface
export interface Client {
  id: string;
  name: string; 
  email: string;
  phone: string;
  registrationDate: string;
  isActive: boolean;
  notes: string;
  qrCode?: string; // QR code data URL
}

// Sheet name for clients
const SHEET_NAME = 'clients';

// Headers for the clients sheet
const CLIENT_HEADERS = [
  'id',
  'name',
  'email',
  'phone',
  'registrationDate',
  'isActive',
  'notes',
  'qrCode'
];

// Initialize the clients sheet if it doesn't exist
export async function initClientSheet(): Promise<void> {
  await createSheet(SHEET_NAME, CLIENT_HEADERS);
}

// Get all clients
export async function getClients(): Promise<Client[]> {
  try {
    const clients = await getSheetData(SHEET_NAME);
    return clients.map(client => ({
      ...client,
      isActive: client.isActive === 'TRUE'
    }));
  } catch (error) {
    console.error('Error getting clients:', error);
    return [];
  }
}

// Get a client by ID
export async function getClientById(id: string): Promise<Client | null> {
  try {
    const clients = await getClients();
    return clients.find(client => client.id === id) || null;
  } catch (error) {
    console.error('Error getting client by ID:', error);
    return null;
  }
}

// Generate unique ID with timestamp and random string to avoid duplicates
function generateUniqueId(): string {
  return `client_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Add a new client
export async function addClient(client: Omit<Client, 'id'>): Promise<Client> {
  try {
    const registrationDate = client.registrationDate || new Date().toISOString();
    const id = generateUniqueId();
    
    // Generate QR code for the client
    const qrData = generateClientQRData(id);
    const qrCode = await generateQRCode(qrData);
    
    const newClient: Client = {
      ...client,
      id,
      registrationDate,
      isActive: true,
      notes: client.notes || '',
      qrCode
    };
    
    await appendToSheet(SHEET_NAME, [
      [
        newClient.id,
        newClient.name,
        newClient.email,
        newClient.phone,
        newClient.registrationDate,
        newClient.isActive.toString().toUpperCase(),
        newClient.notes,
        newClient.qrCode
      ]
    ]);
    
    return newClient;
  } catch (error) {
    console.error('Error adding client:', error);
    throw error;
  }
}

// Update a client
export async function updateClient(id: string, updates: Partial<Client>): Promise<Client | null> {
  try {
    // Get all clients
    const clients = await getClients();
    
    // Find the client to update
    const clientIndex = clients.findIndex(client => client.id === id);
    
    if (clientIndex === -1) {
      return null;
    }
    
    // Update the client with new values
    const updatedClient: Client = {
      ...clients[clientIndex],
      ...updates
    };
    
    // Generate QR code if one doesn't exist
    if (!updatedClient.qrCode) {
      const qrData = generateClientQRData(id);
      updatedClient.qrCode = await generateQRCode(qrData);
    }
    
    // Get row index (add 2 to account for header row and 0-indexing)
    const rowIndex = clientIndex + 2;
    
    // Update the row in the sheet
    await updateSheetRow(SHEET_NAME, rowIndex, [
      updatedClient.id,
      updatedClient.name,
      updatedClient.email,
      updatedClient.phone,
      updatedClient.registrationDate,
      updatedClient.isActive.toString().toUpperCase(),
      updatedClient.notes || '',
      updatedClient.qrCode || ''
    ]);
    
    return updatedClient;
  } catch (error) {
    console.error('Error updating client:', error);
    return null;
  }
}

// Delete a client (mark as inactive)
export async function deactivateClient(id: string): Promise<boolean> {
  try {
    return Boolean(await updateClient(id, { isActive: false }));
  } catch (error) {
    console.error('Error deactivating client:', error);
    return false;
  }
}

// Reactivate a client
export async function activateClient(id: string): Promise<boolean> {
  try {
    return Boolean(await updateClient(id, { isActive: true }));
  } catch (error) {
    console.error('Error activating client:', error);
    return false;
  }
}
