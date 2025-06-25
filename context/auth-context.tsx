"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import {
  onAuthStateChange,
  signInWithEmailAndPassword,
  signUpWithEmailAndPassword,
  signInWithGooglePopup,
  signOut,
} from "@/lib/auth-utils";
import { getOrCreateUserProfile } from "@/lib/user-utils";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (
    email: string,
    password: string,
    name?: string
  ) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Initialize Firebase Auth listener
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // Ensure user profile exists
        await getOrCreateUserProfile(user.uid, {
          displayName: user.displayName || undefined,
          email: user.email || undefined,
          photoURL: user.photoURL || undefined,
        });
      }

      setUser(user);
      setLoading(false);
      if (
        !user &&
        window.location.pathname !== "/login" &&
        window.location.pathname !== "/signup"
      ) {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const signInWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(email, password);
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
    name?: string
  ) => {
    await signUpWithEmailAndPassword(email, password, name);
  };

  const signInWithGoogle = async () => {
    await signInWithGooglePopup();
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      // Router redirect will be handled by the onAuthStateChange
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut: handleSignOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
