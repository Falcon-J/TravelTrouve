import { db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

// Type for user profile data
export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Cache for user profiles to avoid repeated API calls
const userProfileCache = new Map<string, UserProfile>();
const cacheExpiry = new Map<string, number>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get or create a user profile in Firestore
 */
export async function getOrCreateUserProfile(
  userId: string,
  userInfo?: {
    displayName?: string;
    email?: string;
    photoURL?: string;
  }
): Promise<UserProfile | null> {
  try {
    // Check cache first
    const cached = userProfileCache.get(userId);
    const cacheTime = cacheExpiry.get(userId) || 0;

    if (cached && Date.now() - cacheTime < CACHE_DURATION) {
      return cached;
    }

    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);

    let userProfile: UserProfile;

    if (userDoc.exists()) {
      // User profile exists, return it
      const data = userDoc.data();
      userProfile = {
        id: userId,
        displayName:
          data.displayName ||
          data.name ||
          userInfo?.displayName ||
          "Unknown User",
        email: data.email || userInfo?.email || "",
        photoURL: data.photoURL || userInfo?.photoURL,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    } else if (userInfo) {
      // User profile doesn't exist, create it
      const now = new Date();
      userProfile = {
        id: userId,
        displayName:
          userInfo.displayName ||
          userInfo.email?.split("@")[0] ||
          "Unknown User",
        email: userInfo.email || "",
        photoURL: userInfo.photoURL,
        createdAt: now,
        updatedAt: now,
      };

      // Save to Firestore
      await setDoc(userDocRef, {
        displayName: userProfile.displayName,
        email: userProfile.email,
        photoURL: userProfile.photoURL,
        createdAt: now,
        updatedAt: now,
      });
    } else {
      // No user info provided and profile doesn't exist
      return null;
    }

    // Update cache
    userProfileCache.set(userId, userProfile);
    cacheExpiry.set(userId, Date.now());

    return userProfile;
  } catch (error) {
    console.error("Error getting user profile:", error);
    return null;
  }
}

/**
 * Get user display name by user ID
 */
export async function getUserDisplayName(userId: string): Promise<string> {
  try {
    const profile = await getOrCreateUserProfile(userId);
    return profile?.displayName || userId.slice(0, 8);
  } catch (error) {
    console.error("Error getting user display name:", error);
    return userId.slice(0, 8);
  }
}

/**
 * Batch get user display names for multiple user IDs
 */
export async function getUserDisplayNames(
  userIds: string[]
): Promise<Record<string, string>> {
  const results: Record<string, string> = {};

  await Promise.all(
    userIds.map(async (userId) => {
      results[userId] = await getUserDisplayName(userId);
    })
  );

  return results;
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<Omit<UserProfile, "id" | "createdAt">>
): Promise<void> {
  try {
    const userDocRef = doc(db, "users", userId);
    const updateData = {
      ...updates,
      updatedAt: new Date(),
    };

    await setDoc(userDocRef, updateData, { merge: true });

    // Update cache
    const cached = userProfileCache.get(userId);
    if (cached) {
      userProfileCache.set(userId, { ...cached, ...updateData });
      cacheExpiry.set(userId, Date.now());
    }
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
}

/**
 * Clear the user cache (useful for testing or when user data changes)
 */
export function clearUserCache(): void {
  userProfileCache.clear();
  cacheExpiry.clear();
}
