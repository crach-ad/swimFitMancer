import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore as getFirestoreInstance, Firestore } from 'firebase/firestore';
import { getAuth as getAuthInstance, Auth } from 'firebase/auth';

// Your Firebase configuration with actual values
// Note: In production, these should be moved to environment variables
const firebaseConfig = {
  apiKey: "AIzaSyBRFQlCEWfbudUqgtHMo_3qpsa_am9Ldys",
  authDomain: "swimfit-5647c.firebaseapp.com",
  projectId: "swimfit-5647c",
  storageBucket: "swimfit-5647c.firebasestorage.app",
  messagingSenderId: "112547511405",
  appId: "1:112547511405:web:0a08efb1e028729d4c5364",
  measurementId: "G-1KBBWN51X6"
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
