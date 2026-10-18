/**
 * @file firebaseConfig.js
 * Firebase initialization and configuration skeleton for React.
 *
 * Instructions for entering your credentials:
 * 1. Go to the Firebase Console: https://console.firebase.google.com/
 * 2. Select or create your project.
 * 3. Go to Project Settings (gear icon) > General.
 * 4. Scroll down to "Your apps" and select the Web app icon (</>).
 * 5. Copy the configuration object values into the placeholders below or into your .env file.
 * 6. Under Firebase Authentication > Sign-in method, ensure "Google" provider is enabled.
 * 7. Under Firestore Database, create a database in test or production mode.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';

// Clean placeholder configuration.
// Replace these strings with your actual Firebase project values or set VITE_FIREBASE_* in your environment.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'YOUR_FIREBASE_API_KEY',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'YOUR_PROJECT_ID.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'YOUR_PROJECT_ID',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'YOUR_PROJECT_ID.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'YOUR_MESSAGING_SENDER_ID',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'YOUR_APP_ID',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-XXXXXXXXXX',
};

// Check if credentials have been populated with real values
export const isFirebaseConfigured = () => {
  return (
    Boolean(firebaseConfig.apiKey) &&
    firebaseConfig.apiKey !== 'YOUR_FIREBASE_API_KEY' &&
    !firebaseConfig.apiKey.includes('YOUR_')
  );
};

// Initialize Firebase App safely (singleton pattern)
const app = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApp();

// Initialize Firebase Authentication
const auth = getAuth(app);

// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Initialize Cloud Firestore
const db = getFirestore(app);

/**
 * Helper: Sign in with Google Popup
 * @returns {Promise<import('firebase/auth').UserCredential>}
 */
export const signInWithGoogle = async () => {
  if (!isFirebaseConfigured()) {
    console.warn(
      '[Firebase] Placeholder credentials detected in firebaseConfig.js. Please enter your real Firebase keys to enable Google Sign-In.'
    );
    throw new Error(
      'Firebase credentials not configured yet. Please update src/firebaseConfig.js with your Firebase project keys.'
    );
  }
  return await signInWithPopup(auth, googleProvider);
};

/**
 * Helper: Sign out current user
 * @returns {Promise<void>}
 */
export const logOut = async () => {
  return await signOut(auth);
};

/**
 * Helper: Write chat log or session record to Firestore
 * @param {string} collectionName
 * @param {object} logData
 */
export const saveChatLogToFirestore = async (collectionName = 'chat_logs', logData = {}) => {
  if (!isFirebaseConfigured()) {
    console.warn('[Firebase] Firestore write skipped: Firebase credentials not set.');
    return null;
  }
  return await addDoc(collection(db, collectionName), {
    ...logData,
    timestamp: serverTimestamp(),
  });
};

export { app, auth, db, googleProvider, onAuthStateChanged, firebaseConfig };
export default app;
