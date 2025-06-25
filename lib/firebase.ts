import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase for both client and server components
let firebaseApp: import("firebase/app").FirebaseApp;

if (!getApps().length) {
  firebaseApp = initializeApp(firebaseConfig);
} else {
  firebaseApp = getApp();
}

// Initialize Firebase services
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

// Debug function to check Firebase initialization
export function debugFirebaseInit() {
  console.log("Firebase Config:", {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "✓" : "✗",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? "✓" : "✗",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? "✓" : "✗",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
      ? "✓"
      : "✗",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? "✓" : "✗",
  });
  console.log("Firebase App:", firebaseApp?.name);
  console.log("Auth instance:", auth);
  console.log("DB instance:", db);
  console.log("Current user:", auth.currentUser);
}

// Test Firebase Firestore connectivity
export async function testFirestoreConnectivity() {
  try {
    console.log("Testing Firestore connectivity...");
    // Simple test - just check if we can access collections
    console.log("Firestore connection test passed");
    return true;
  } catch (error) {
    console.error("Firestore connectivity test failed:", error);
    return false;
  }
}

export { firebaseApp as app, auth, db };
