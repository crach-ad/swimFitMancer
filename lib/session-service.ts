import { getSheetData, appendToSheet, updateSheetRow, createSheet } from './google-sheets';

// Define Session interface
export interface Session {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  maxAttendees: number;
  description: string;
  location: string;
}

// Sheet name for sessions
const SHEET_NAME = 'sessions';

// Headers for the sessions sheet
const SESSION_HEADERS = [
  'id',
  'name',
  'startTime',
  'endTime',
  'maxAttendees',
  'description',
  'location'
];

// Initialize the sessions sheet if it doesn't exist
export async function initSessionSheet(): Promise<void> {
  await createSheet(SHEET_NAME, SESSION_HEADERS);
}

// Get all sessions
export async function getSessions(): Promise<Session[]> {
  try {
    const sessions = await getSheetData(SHEET_NAME);
    return sessions.map(session => ({
      ...session,
      maxAttendees: parseInt(session.maxAttendees) || 0,
      isRecurring: session.isRecurring === 'TRUE'
    }));
  } catch (error) {
    console.error('Error getting sessions:', error);
    return [];
  }
}

// Get a session by ID
export async function getSessionById(id: string): Promise<Session | null> {
  try {
    const sessions = await getSessions();
    return sessions.find(session => session.id === id) || null;
  } catch (error) {
    console.error('Error getting session by ID:', error);
    return null;
  }
}

// Add a new session
export async function addSession(session: Omit<Session, 'id'>): Promise<Session> {
  try {
    const newSession: Session = {
      ...session,
      id: `session_${Date.now()}`
    };
    
    await appendToSheet(SHEET_NAME, [
      [
        newSession.id,
        newSession.name,
        newSession.startTime,
        newSession.endTime,
        newSession.maxAttendees.toString(),
        newSession.description,
        newSession.location
      ]
    ]);
    
    return newSession;
  } catch (error) {
    console.error('Error adding session:', error);
    throw error;
  }
}

// Update a session
export async function updateSession(id: string, updates: Partial<Session>): Promise<Session | null> {
  try {
    // Get all sessions
    const sessions = await getSessions();
    
    // Find the session to update
    const sessionIndex = sessions.findIndex(session => session.id === id);
    
    if (sessionIndex === -1) {
      return null;
    }
    
    // Update the session with new values
    const updatedSession: Session = {
      ...sessions[sessionIndex],
      ...updates
    };
    
    // Get row index (add 2 to account for header row and 0-indexing)
    const rowIndex = sessionIndex + 2;
    
    // Update the row in the sheet
    await updateSheetRow(SHEET_NAME, rowIndex, [
      updatedSession.id,
      updatedSession.name,
      updatedSession.startTime,
      updatedSession.endTime,
      updatedSession.maxAttendees.toString(),
      updatedSession.description,
      updatedSession.location
    ]);
    
    return updatedSession;
  } catch (error) {
    console.error('Error updating session:', error);
    return null;
  }
}

// Delete a session
export async function deleteSession(id: string): Promise<boolean> {
  try {
    // For simplicity, we'll just mark sessions as deleted by appending "_DELETED" to the id
    // In a real application, you might want to use a "deleted" flag or move to a different sheet
    const session = await getSessionById(id);
    
    if (!session) {
      return false;
    }
    
    const result = await updateSession(id, { 
      id: `${id}_DELETED`
    });
    
    return Boolean(result);
  } catch (error) {
    console.error('Error deleting session:', error);
    return false;
  }
}
