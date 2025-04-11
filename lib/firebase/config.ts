import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore as getFirestoreInstance, Firestore } from 'firebase/firestore';
import { getAuth as getAuthInstance, Auth } from 'firebase/auth';

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase app (ensure it's only initialized once)
const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
console.log('Firebase initialized successfully');

// Get Firestore instance
export function getFirestore(): Firestore {
  return getFirestoreInstance(firebaseApp);
}

// Get Auth instance
export function getAuth(): Auth {
  return getAuthInstance(firebaseApp);
}

// Get Firebase app instance
export function getFirebaseApp(): FirebaseApp {
  return firebaseApp;
}
