import { initializeApp, getApps } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator, setLogLevel } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

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
  }
}

export const getFirebase = () => {
  if (!app) initializeFirebase();
  return { app, auth, db };
};
export { auth, db };

