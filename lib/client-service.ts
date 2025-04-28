import { getAll, getById, add, update, remove, initializeCollection } from './firebase/db';
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
  packageLimit?: number; // Maximum number of sessions in a package
  sessionCount?: number; // Current count of sessions attended
}

// Collection name for clients
const COLLECTION_NAME = 'clients';

// Initialize the clients collection if it doesn't exist
export async function initClientSheet(): Promise<void> {
  await initializeCollection(COLLECTION_NAME);
}

// Get all clients
export async function getClients(): Promise<Client[]> {
  try {
    const clients = await getAll<Client>(COLLECTION_NAME);
    return clients.map(client => ({
      ...client,
      isActive: typeof client.isActive === 'string' 
        ? client.isActive === 'TRUE' || client.isActive === 'true'
        : Boolean(client.isActive)
    }));
  } catch (error) {
    console.error('Error getting clients:', error);
    return [];
  }
}

// Get a client by ID
export async function getClientById(id: string): Promise<Client | null> {
  try {
    return await getById<Client>(COLLECTION_NAME, id);
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
    
    // Add to database
    await add<Client>(COLLECTION_NAME, newClient);
    
    return newClient;
  } catch (error) {
    console.error('Error adding client:', error);
    throw error;
  }
}

// Update a client
export async function updateClient(id: string, updates: Partial<Client>): Promise<Client | null> {
  try {
    // Get current client
    const existingClient = await getClientById(id);
    
    if (!existingClient) {
      return null;
    }
    
    // Update the client with new values
    const updatedClient: Client = {
      ...existingClient,
      ...updates
    };
    
    // Generate QR code if one doesn't exist
    if (!updatedClient.qrCode) {
      const qrData = generateClientQRData(id);
      updatedClient.qrCode = await generateQRCode(qrData);
    }
    
    // Update in database
    await update<Client>(COLLECTION_NAME, id, updatedClient);
    
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
