import { getAll, getById, add, update, remove, initializeCollection } from './firebase/db';
import { getClientById } from './client-service';
import { getSessionById } from './session-service';

// Define Attendance interface
export interface Attendance {
  id: string;
  clientId: string;
  clientName?: string; // Added for spreadsheet display
  sessionId: string;
  sessionName?: string; // Added for spreadsheet display
  checkInTime: string;
  notes: string;
}

// Collection names for attendance
const COLLECTION_NAME = 'attendance';
const SESSION_ATTENDANCE_FORMAT = 'sessions/{sessionId}/attendance';

// Initialize the attendance collection if it doesn't exist
export async function initAttendanceSheet(): Promise<void> {
  await initializeCollection(COLLECTION_NAME);
}

// Get all attendance records across all sessions
export async function getAttendanceRecords(): Promise<Attendance[]> {
  try {
    // First get records from the main attendance collection (legacy records)
    const legacyRecords = await getAll<Attendance>(COLLECTION_NAME);
    
    // Then get all sessions to fetch their attendance subcollections
    const sessions = await getAll<any>('sessions');
    
    // Collect attendance records from each session's subcollection
    const sessionRecordsPromises = sessions.map(async (session) => {
      const sessionAttendancePath = SESSION_ATTENDANCE_FORMAT.replace('{sessionId}', session.id);
      try {
        return await getAll<Attendance>(sessionAttendancePath);
      } catch (error) {
        console.error(`Error getting attendance for session ${session.id}:`, error);
        return [];
      }
    });
    
    // Wait for all session attendance queries to complete
    const sessionRecordsArrays = await Promise.all(sessionRecordsPromises);
    
    // Flatten the arrays and combine with legacy records
    const sessionRecords = sessionRecordsArrays.flat();
    
    return [...legacyRecords, ...sessionRecords];
  } catch (error) {
    console.error('Error getting attendance records:', error);
    return [];
  }
}

// Get attendance records for a specific client
export async function getClientAttendance(clientId: string): Promise<Attendance[]> {
  try {
    const records = await getAttendanceRecords();
    return records.filter(record => record.clientId === clientId);
  } catch (error) {
    console.error('Error getting client attendance:', error);
    return [];
  }
}

// Get attendance records for a specific session
export async function getSessionAttendance(sessionId: string): Promise<Attendance[]> {
  try {
    // Get attendance directly from the session's attendance subcollection
    const sessionAttendancePath = SESSION_ATTENDANCE_FORMAT.replace('{sessionId}', sessionId);
    const sessionRecords = await getAll<Attendance>(sessionAttendancePath);
    
    // Also check legacy records in the main attendance collection
    const legacyRecords = await getAll<Attendance>(COLLECTION_NAME);
    const filteredLegacyRecords = legacyRecords.filter(record => record.sessionId === sessionId);
    
    // Combine both sets of records
    return [...sessionRecords, ...filteredLegacyRecords];
  } catch (error) {
    console.error(`Error getting attendance for session ${sessionId}:`, error);
    return [];
  }
}

// Record a new attendance check-in
export async function recordAttendance(
  clientId: string,
  sessionId: string,
  notes: string = '',
  timestamp?: string
): Promise<Attendance | null> {
  try {
    console.log('recordAttendance called with:', { clientId, sessionId, notes });
    
    // Verify the client and session exist
    console.log('Getting client data for ID:', clientId);
    const client = await getClientById(clientId);
    console.log('Client lookup result:', client ? `Found: ${client.name}` : 'Not found');
    
    console.log('Getting session data for ID:', sessionId);
    const session = await getSessionById(sessionId);
    console.log('Session lookup result:', session ? `Found: ${session.name}` : 'Not found');
    
    if (!client || !session) {
      console.error('Client or session not found', { clientFound: !!client, sessionFound: !!session });
      return null;
    }
    
    const newAttendance: Attendance = {
      id: `attendance_${Date.now()}`,
      clientId,
      clientName: client.name,
      sessionId,
      sessionName: session.name,
      checkInTime: timestamp || new Date().toISOString(),
      notes
    };
    
    console.log('Created attendance record:', newAttendance);
    
    // Add attendance record to the session's attendance subcollection
    const sessionAttendancePath = SESSION_ATTENDANCE_FORMAT.replace('{sessionId}', sessionId);
    console.log(`Adding attendance record to session-specific collection: ${sessionAttendancePath}`);
    
    await add<Attendance>(sessionAttendancePath, newAttendance);
    
    console.log('Successfully added attendance record to session-specific collection');
    
    // Update client's attendance stats
    console.log('Updating client attendance stats');
    await updateClientAttendanceStats(clientId);
    
    console.log('Attendance record complete, returning data');
    return newAttendance;
  } catch (error) {
    console.error('Error recording attendance:', error);
    return null;
  }
}

// Calculate and update a client's attendance statistics
async function updateClientAttendanceStats(clientId: string): Promise<void> {
  try {
    // Get all attendance records for the client
    const clientAttendance = await getClientAttendance(clientId);
    
    // Get the client
    const client = await getClientById(clientId);
    
    if (!client) {
      console.error('Client not found when updating attendance stats');
      return;
    }
    
    // Calculate attendance info
    const sessionCount = clientAttendance.length;
    const attendanceInfo = `Sessions attended: ${sessionCount}`;
    
    // Update the client's notes field with attendance info
    const { updateClient } = await import('./client-service');
    
    // Check if the client already has notes and append to them
    let updatedNotes = client.notes || '';
    
    // If there are existing notes that don't contain attendance info, add a separator
    if (updatedNotes && !updatedNotes.includes('Sessions attended:')) {
      updatedNotes += ' | ';
    }
    
    // Add/update the attendance info part of the notes
    // This replaces any existing attendance info in the notes
    if (updatedNotes.includes('Sessions attended:')) {
      updatedNotes = updatedNotes.replace(/Sessions attended: \d+/, attendanceInfo);
    } else {
      updatedNotes += attendanceInfo;
    }
    
    await updateClient(clientId, {
      notes: updatedNotes
    });
  } catch (error) {
    console.error('Error updating client attendance stats:', error);
  }
}
