/**
 * Database Interface
 * 
 * This file centralizes all database operations and exports them from our
 * Firebase Firestore implementation. It serves as an abstraction layer that
 * allows the application to remain agnostic about the underlying database.
 * 
 * All operations follow a consistent API pattern that closely matches
 * the CRUD operations expected by the application components.
 */

// Re-export all Firebase database operations
export { 
  getAll, 
  getById, 
  add, 
  update, 
  remove, 
  initializeCollection 
} from '../firebase/db';

/**
 * Initializes the database connection.
 * This is a no-op for Firebase as initialization happens in the Firebase config,
 * but we keep it for API compatibility with the previous implementation.
 */
export async function initializeDatabase(): Promise<void> {
  // Firebase initialization happens in ../firebase/config.ts
  // This function is kept for backward compatibility
  console.log('Firebase database connection ready');
  return Promise.resolve();
}
