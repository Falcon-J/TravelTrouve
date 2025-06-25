import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword as fbSignInWithEmail,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  type User,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";

export async function signUpWithEmailAndPassword(
  email: string,
  password: string,
  name?: string
) {
  try {
    const { user } = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Create user profile in Firestore
    await setDoc(doc(db, "users", user.uid), {
      displayName: name || email.split("@")[0], // Use displayName instead of name
      email,
      photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(
        name || email
      )}`, // Use photoURL instead of avatar
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return user;
  } catch (error) {
    throw error;
  }
}

export async function signInWithEmailAndPassword(
  email: string,
  password: string
) {
  try {
    const { user } = await fbSignInWithEmail(auth, email, password);
    return user;
  } catch (error) {
    throw error;
  }
}

export async function signInWithGooglePopup() {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: "select_account",
    });

    const { user } = await signInWithPopup(auth, provider);

    // Check if user profile exists
    const userDoc = await getDoc(doc(db, "users", user.uid));

    if (!userDoc.exists()) {
      // Create user profile if it doesn't exist
      const userData = {
        displayName: user.displayName || user.email?.split("@")[0] || "User",
        email: user.email || "",
        photoURL:
          user.photoURL ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            user.displayName || user.email || "User"
          )}`,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, "users", user.uid), userData);
    }

    return user;
  } catch (error: any) {
    if (error?.code === "auth/popup-closed-by-user") {
      throw new Error("Sign in cancelled by user");
    }
    throw error;
  }
}

export async function signOut() {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    throw error;
  }
}

export function onAuthStateChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function getCurrentUser() {
  const user = auth.currentUser;
  if (!user) return null;

  const userDoc = await getDoc(doc(db, "users", user.uid));
  return {
    ...user,
    ...userDoc.data(),
  };
}
