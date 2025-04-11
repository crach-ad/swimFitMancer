import { getAll, getById, add, update, remove, initializeCollection } from './firebase/db';

// Define Session interface
export interface Session {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  maxAttendees: number;
  description: string;
  location: string;
  level?: string;           // Difficulty level of the session
  recurringDays?: string;   // JSON string of recurring days
  selectedDays?: number[];  // Days of week (0=Sunday, 6=Saturday)
  isRecurring?: boolean;    // Whether this is a recurring session
  recurringEndDate?: string; // End date for recurring sessions
}

// Collection name for sessions
const COLLECTION_NAME = 'sessions';

// Initialize the sessions collection if it doesn't exist
export async function initSessionSheet(): Promise<void> {
  await initializeCollection(COLLECTION_NAME);
}

// Get all sessions
export async function getSessions(): Promise<Session[]> {
  try {
    const sessions = await getAll<Session>(COLLECTION_NAME);
    return sessions.map(session => ({
      ...session,
      maxAttendees: typeof session.maxAttendees === 'string' ? parseInt(session.maxAttendees) || 0 : session.maxAttendees
    }));
  } catch (error) {
    console.error('Error getting sessions:', error);
    return [];
  }
}

// Get a session by ID
export async function getSessionById(id: string): Promise<Session | null> {
  try {
    return await getById<Session>(COLLECTION_NAME, id);
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
    
    // Add to database
    await add<Session>(COLLECTION_NAME, newSession);
    
    return newSession;
  } catch (error) {
    console.error('Error adding session:', error);
    throw error;
  }
}

// Update a session
export async function updateSession(id: string, updates: Partial<Session>): Promise<Session | null> {
  try {
    // Get current session
    const existingSession = await getSessionById(id);
    
    if (!existingSession) {
      return null;
    }
    
    // Update the session with new values
    const updatedSession: Session = {
      ...existingSession,
      ...updates
    };
    
    // Update in database
    await update<Session>(COLLECTION_NAME, id, updatedSession);
    
    return updatedSession;
  } catch (error) {
    console.error('Error updating session:', error);
    return null;
  }
}

// Delete a session
export async function deleteSession(id: string): Promise<boolean> {
  try {
    // Check if session exists
    const session = await getSessionById(id);
    
    if (!session) {
      return false;
    }
    
    // Remove from database
    return await remove<Session>(COLLECTION_NAME, id);
  } catch (error) {
    console.error('Error deleting session:', error);
    return false;
  }
}
