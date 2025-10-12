<<<<<<< HEAD
import { initializeApp, getApps } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator, setLogLevel } from "firebase/firestore";
=======
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { checkFirebaseConfig, logFirebaseStatus } from "./firebase-check";
>>>>>>> origin/main

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

<<<<<<< HEAD
let app, auth, db;

export function initializeFirebase() {
  if (!firebaseConfig.apiKey) {
    console.warn("Firebase API key missing — skipping initialization.");
    return { app: undefined, auth: undefined, db: undefined };
  }

  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      db = getFirestore(app);

      if (import.meta.env.DEV) {
        setLogLevel("error"); // quieter logs
      }

      if (import.meta.env.VITE_FIREBASE_USE_EMULATOR === "true") {
        const host = import.meta.env.VITE_FIREBASE_EMULATOR_HOST || "localhost";
        connectFirestoreEmulator(db, host, 8080);
        connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true });
      }
    }
    return { app, auth, db };
  } catch (err) {
    console.error("Firebase init failed:", err);
    return { app: undefined, auth: undefined, db: undefined };
=======
// Initialize Firebase (singleton pattern)
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

export function initializeFirebase() {
  // Check if Firebase config is valid
  const configStatus = checkFirebaseConfig();
  
  if (!configStatus.isConfigured) {
    console.error('❌ Firebase Configuration Error:', configStatus.message);
    console.error('Please check your .env.local file and ensure all Firebase environment variables are set correctly.');
    throw new Error('Firebase not configured. Check console for details.');
  }
  
  if (!getApps().length) {
    try {
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      db = getFirestore(app);
      logFirebaseStatus();
      console.log('✓ Firebase initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Firebase:', error);
      throw error;
    }
  } else {
    app = getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
>>>>>>> origin/main
  }
}

<<<<<<< HEAD
export const getFirebase = () => {
  if (!app) initializeFirebase();
  return { app, auth, db };
};
=======
// Getter functions to ensure Firebase is initialized
export function getFirebaseAuth(): Auth {
  if (!auth) {
    throw new Error("Firebase not initialized. Call initializeFirebase() first.");
  }
  return auth;
}

export function getFirebaseDb(): Firestore {
  if (!db) {
    throw new Error("Firebase not initialized. Call initializeFirebase() first.");
  }
  return db;
}

// Export instances (for backward compatibility, but prefer getter functions)
>>>>>>> origin/main
export { auth, db };

