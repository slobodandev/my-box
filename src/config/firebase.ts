/**
 * Firebase Configuration
 *
 * This file initializes and exports Firebase app instance and services.
 * The configuration uses environment variables for security.
 */

import { initializeApp, FirebaseApp, getApps } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAnalytics, Analytics, isSupported } from 'firebase/analytics';
import { getDataConnect, DataConnect, connectDataConnectEmulator } from 'firebase/data-connect';

// Firebase configuration object
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Validate that all required config values are present
const validateConfig = (): void => {
  const requiredKeys = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
  ] as const;

  const missingKeys = requiredKeys.filter(
    (key) => !firebaseConfig[key]
  );

  if (missingKeys.length > 0) {
    console.error('Missing Firebase configuration keys:', missingKeys);
    throw new Error(
      `Firebase configuration is incomplete. Missing: ${missingKeys.join(', ')}`
    );
  }
};

// Initialize Firebase app (only once)
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let analytics: Analytics | null = null;
let dataConnect: DataConnect;

// Data Connect configuration
const dataConnectConfig = {
  connector: 'mybox-connector',
  service: 'mybox-dataconnect',
  location: 'us-central1',
};

try {
  validateConfig();

  // Check if Firebase has already been initialized
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    console.log('Firebase app initialized successfully');
  } else {
    app = getApps()[0];
    console.log('Firebase app already initialized');
  }

  // Initialize Firebase services
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  dataConnect = getDataConnect(app, dataConnectConfig);

  // Connect to emulators if enabled via environment variable
  const useEmulators = import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true';

  if (useEmulators) {
    console.log('🔧 Firebase Emulators Mode Enabled');

    // Import emulator connection functions
    const { connectAuthEmulator } = await import('firebase/auth');
    const { connectFirestoreEmulator } = await import('firebase/firestore');
    const { connectStorageEmulator } = await import('firebase/storage');

    // Connect to Auth emulator
    try {
      connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
      console.log('✅ Connected to Auth emulator on port 9099');
    } catch (error) {
      console.warn('⚠️ Auth emulator connection failed:', error);
    }

    // Connect to Firestore emulator
    try {
      connectFirestoreEmulator(db, '127.0.0.1', 8082);
      console.log('✅ Connected to Firestore emulator on port 8082');
    } catch (error) {
      console.warn('⚠️ Firestore emulator connection failed:', error);
    }

    // Connect to Storage emulator
    try {
      connectStorageEmulator(storage, '127.0.0.1', 9199);
      console.log('✅ Connected to Storage emulator on port 9199');
    } catch (error) {
      console.warn('⚠️ Storage emulator connection failed:', error);
    }

    // Connect to Data Connect emulator
    try {
      connectDataConnectEmulator(dataConnect, '127.0.0.1', 9399);
      console.log('✅ Connected to Data Connect emulator on port 9399');
    } catch (error) {
      console.warn('⚠️ Data Connect emulator connection failed:', error);
    }
  } else {
    console.log('🌐 Firebase Production Mode');
  }

  // Initialize Analytics (only in production and if supported)
  if (import.meta.env.PROD) {
    isSupported().then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
        console.log('Firebase Analytics initialized');
      }
    });
  }
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw error;
}

// Export Firebase services
export { app, auth, db, storage, analytics, dataConnect };

// Export Firebase service getters for lazy initialization
export const getFirebaseAuth = (): Auth => auth;
export const getFirebaseFirestore = (): Firestore => db;
export const getFirebaseStorage = (): FirebaseStorage => storage;
export const getFirebaseAnalytics = (): Analytics | null => analytics;
export const getFirebaseDataConnect = (): DataConnect => dataConnect;

// Default export
export default app;
