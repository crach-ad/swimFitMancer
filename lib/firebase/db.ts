import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  DocumentData
} from 'firebase/firestore';
import { getFirestore as getFirestoreInstance } from './config';

// Get all items from a collection (supports nested paths like 'sessions/{sessionId}/attendance')
export async function getAll<T>(collectionPath: string): Promise<T[]> {
  try {
    const db = getFirestoreInstance();
    
    // Handle nested collection paths
    let collectionRef;
    if (collectionPath.includes('/')) {
      // For nested paths, use the full path segments
      collectionRef = collection(db, collectionPath);
    } else {
      // For top-level collections, use the simple approach
      collectionRef = collection(db, collectionPath);
    }
    
    const querySnapshot = await getDocs(collectionRef);
    
    const items: T[] = [];
    querySnapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() } as T);
    });
    
    return items;
  } catch (error) {
    console.error(`Error fetching collection ${collectionPath}:`, error);
    return [];
  }
}

// Get an item by id from a collection (supports nested paths)
export async function getById<T extends { id: string }>(collectionPath: string, id: string): Promise<T | null> {
  try {
    const db = getFirestoreInstance();
    
    // Handle nested collection paths
    let docRef;
    if (collectionPath.includes('/')) {
      // For nested collections, use the full path
      docRef = doc(db, collectionPath, id);
    } else {
      // For top-level collections, use the simple approach
      docRef = doc(db, collectionPath, id);
    }
    
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    }
    
    return null;
  } catch (error) {
    console.error(`Error getting document from ${collectionPath}:`, error);
    return null;
  }
}

// Add an item to a collection (supports nested paths like 'sessions/{sessionId}/attendance')
export async function add<T extends { id: string }>(collectionPath: string, item: T): Promise<T> {
  try {
    const db = getFirestoreInstance();
    const { id, ...data } = item;
    
    // Create the appropriate document reference based on whether it's a nested path
    let docRef;
    if (collectionPath.includes('/')) {
      // For nested collections
      docRef = id ? doc(db, collectionPath, id) : doc(collection(db, collectionPath));
    } else {
      // For top-level collections
      docRef = id ? doc(db, collectionPath, id) : doc(collection(db, collectionPath));
    }
    
    const docId = id || docRef.id;
    
    // Include the ID in the document data for consistency
    await setDoc(docRef, { ...data, id: docId });
    
    return { ...item, id: docId };
  } catch (error) {
    console.error(`Error adding document to ${collectionPath}:`, error);
    throw new Error(`Failed to add item to ${collectionPath}`);
  }
}

// Update an item in a collection (supports nested paths)
export async function update<T extends { id: string }>(collectionPath: string, id: string, updates: T): Promise<T | null> {
  try {
    const db = getFirestoreInstance();
    
    // Handle nested collection paths
    let docRef;
    if (collectionPath.includes('/')) {
      // For nested collections
      docRef = doc(db, collectionPath, id);
    } else {
      // For top-level collections
      docRef = doc(db, collectionPath, id);
    }
    
    // First check if the document exists
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return null;
    }
    
    // Remove the id from the updates as we don't want to update it in the document data
    const { id: _, ...updateData } = updates;
    
    await updateDoc(docRef, updateData as DocumentData);
    
    return { ...updates, id };
  } catch (error) {
    console.error(`Error updating document in ${collectionPath}:`, error);
    throw new Error(`Failed to update item in ${collectionPath}`);
  }
}

// Remove an item from a collection (supports nested paths)
export async function remove<T extends { id: string }>(collectionPath: string, id: string): Promise<boolean> {
  try {
    const db = getFirestoreInstance();
    
    // Handle nested collection paths
    let docRef;
    if (collectionPath.includes('/')) {
      // For nested collections
      docRef = doc(db, collectionPath, id);
    } else {
      // For top-level collections
      docRef = doc(db, collectionPath, id);
    }
    
    // Check if document exists before attempting to delete
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return false;
    }
    
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error(`Error removing document from ${collectionPath}:`, error);
    throw new Error(`Failed to remove item from ${collectionPath}`);
  }
}

// Initialize a collection (no-op in Firestore as collections are created automatically)
export async function initializeCollection(collectionPath: string): Promise<void> {
  // Firestore creates collections automatically when documents are added
  // This function is kept for API compatibility with the previous implementation
  // Also supports nested collection paths like 'sessions/{sessionId}/attendance'
  console.log(`Collection ${collectionPath} will be created automatically when data is added`);
}
