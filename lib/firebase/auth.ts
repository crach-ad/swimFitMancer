import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile,
  User as FirebaseUser,
  UserCredential
} from 'firebase/auth';
import { getAuth as getAuthInstance } from './config';

// User type
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

// Convert Firebase User to our User type
function mapFirebaseUserToUser(user: FirebaseUser): User {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL
  };
}

// Sign in with email and password
export async function signIn(email: string, password: string): Promise<User> {
  try {
    const auth = getAuthInstance();
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return mapFirebaseUserToUser(userCredential.user);
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
}

// Sign up with email and password
export async function signUp(email: string, password: string): Promise<User> {
  try {
    const auth = getAuthInstance();
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return mapFirebaseUserToUser(userCredential.user);
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
}

// Sign out
export async function signOut(): Promise<void> {
  try {
    const auth = getAuthInstance();
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

// Get current user
export function getCurrentUser(): User | null {
  const auth = getAuthInstance();
  const firebaseUser = auth.currentUser;
  return firebaseUser ? mapFirebaseUserToUser(firebaseUser) : null;
}

// Update user profile
export async function updateUserProfile(profileData: { displayName?: string; photoURL?: string }): Promise<User> {
  try {
    const auth = getAuthInstance();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('No user is currently signed in');
    }
    
    // Use the Firebase method to update profile
    await firebaseUpdateProfile(user, profileData);
    
    // Return updated user data
    return mapFirebaseUserToUser(user);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

// Subscribe to auth state changes
export function onAuthStateChange(callback: (user: User | null) => void): () => void {
  const auth = getAuthInstance();
  return onAuthStateChanged(auth, (firebaseUser) => {
    callback(firebaseUser ? mapFirebaseUserToUser(firebaseUser) : null);
  });
}
