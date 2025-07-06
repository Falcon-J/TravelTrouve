import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  orderBy,
  arrayUnion,
  arrayRemove,
  increment,
} from "firebase/firestore";
import { db, auth } from "./firebase";
import type { Group, CreateGroupInput } from "@/types/group";
import type { Photo } from "@/types/photo";
import type { User } from "@/types/user";

// Groups Collection Reference
const groupsRef = collection(db, "groups");

// Group Members Collection Reference (subcollection)
const getGroupMembersRef = (groupId: string) =>
  collection(db, `groups/${groupId}/members`);

// Create a new group
export async function createGroup(data: CreateGroupInput) {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    const code = await generateUniqueGroupCode();

    const groupDoc = {
      name: data.name.trim(),
      code,
      isPrivate: data.isPrivate,
      memberCount: 1,
      members: [currentUser.uid],
      recentPhotos: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(groupsRef, groupDoc);
    const groupId = docRef.id;

    await addDoc(getGroupMembersRef(groupId), {
      userId: currentUser.uid,
      role: "Admin",
      joinedAt: serverTimestamp(),
    });

    return {
      ...groupDoc,
      id: groupId,
      role: "Admin", // Default to Admin for creator
      creatorId: currentUser.uid,
      adminIds: [currentUser.uid],
      memberIds: [currentUser.uid],
      photoCount: 0,
    } as Group;
  } catch (error) {
    console.error("Error creating group:", error);
    throw error;
  }
}

// Get all groups for a user with their roles
export async function getUserGroups(userId: string) {
  try {
    const q = query(groupsRef, where("members", "array-contains", userId));
    const querySnapshot = await getDocs(q);

    // Get groups with user roles
    const groupsWithRoles = await Promise.all(
      querySnapshot.docs.map(async (doc) => {
        const groupData = doc.data();
        const groupId = doc.id;

        // Get user's role in this group
        const memberRole = await getMemberRole(groupId, userId);

        return {
          id: groupId,
          ...groupData,
          role: memberRole || "Member", // Default to Member if role not found
        } as Group & { role: "Admin" | "Member" };
      })
    );

    return groupsWithRoles;
  } catch (error) {
    console.error("Error fetching user groups:", error);
    throw error;
  }
}

// Get a single group by ID
export async function getGroupById(groupId: string) {
  try {
    const docRef = doc(groupsRef, groupId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Group;
    }
    return null;
  } catch (error) {
    console.error("Error fetching group:", error);
    throw error;
  }
}

// Join a group
export async function joinGroup(groupId: string, userId: string) {
  try {
    const groupRef = doc(groupsRef, groupId);
    const groupSnap = await getDoc(groupRef);

    if (!groupSnap.exists()) {
      throw new Error("Group not found");
    }

    const groupData = groupSnap.data();
    if (groupData.members?.includes(userId)) {
      throw new Error("User already in group");
    }

    // Add user to the group's members array
    await updateDoc(groupRef, {
      members: arrayUnion(userId),
      memberCount: increment(1),
      updatedAt: serverTimestamp(),
    });

    // Add member document with role
    await addDoc(getGroupMembersRef(groupId), {
      userId,
      role: "Member",
      joinedAt: serverTimestamp(),
    });

    return { id: groupSnap.id, ...groupData } as Group;
  } catch (error) {
    console.error("Error joining group:", error);
    throw error;
  }
}

// Removed uploadGroupPhoto (no storage usage)

// Generate a unique 6-character group code
export async function generateUniqueGroupCode(): Promise<string> {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const codeLength = 6;

  while (true) {
    let code = "";
    for (let i = 0; i < codeLength; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    // Check if code is unique
    const q = query(groupsRef, where("code", "==", code));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return code;
    }
  }
}

// Get a group by its code
export async function getGroupByCode(code: string) {
  try {
    const q = query(groupsRef, where("code", "==", code.toUpperCase()));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Group;
  } catch (error) {
    console.error("Error fetching group by code:", error);
    throw error;
  }
}

// Update group settings
export async function updateGroup(groupId: string, updateData: Partial<Group>) {
  try {
    await updateDoc(doc(groupsRef, groupId), {
      ...updateData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating group:", error);
    throw error;
  }
}

// Delete a group and all its photos
export async function deleteGroup(groupId: string) {
  try {
    // Delete all photos in the group
    const photosRef = collection(db, `groups/${groupId}/photos`);
    const photosSnap = await getDocs(photosRef);

    // Delete photo documents from Firestore (no storage deletion)
    await Promise.all(
      photosSnap.docs.map(async (doc) => {
        await deleteDoc(doc.ref);
      })
    );

    // Finally, delete the group document
    await deleteDoc(doc(groupsRef, groupId));
  } catch (error) {
    console.error("Error deleting group:", error);
    throw error;
  }
}

// Get all photos for a group
export async function getGroupPhotos(groupId: string) {
  try {
    const q = query(
      collection(db, `groups/${groupId}/photos`),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Photo[];
  } catch (error) {
    console.error("Error fetching group photos:", error);
    throw error;
  }
}

// Add a photo to a group (photoData should include a URL or base64 string)
export async function addGroupPhoto(
  groupId: string,
  userId: string,
  photoData: Omit<Photo, "id">
) {
  try {
    const docRef = await addDoc(collection(db, `groups/${groupId}/photos`), {
      ...photoData,
      userId,
      createdAt: serverTimestamp(),
    });
    return { id: docRef.id, ...photoData };
  } catch (error) {
    console.error("Error adding group photo:", error);
    throw error;
  }
}

// Delete a photo from a group (no storage deletion)
export async function deleteGroupPhoto(groupId: string, photoId: string) {
  try {
    await deleteDoc(doc(db, `groups/${groupId}/photos`, photoId));
  } catch (error) {
    console.error("Error deleting group photo:", error);
    throw error;
  }
}

// Get multiple users by their IDs
export async function getUsersByIds(userIds: string[]) {
  try {
    const q = query(collection(db, "users"), where("id", "in", userIds));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as User[];
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

// Add a member to a group
export async function addGroupMember(groupId: string, userId: string) {
  try {
    const groupRef = doc(groupsRef, groupId);
    const groupSnap = await getDoc(groupRef);

    if (!groupSnap.exists()) {
      throw new Error("Group not found");
    }

    const groupData = groupSnap.data();
    if (groupData.members?.includes(userId)) {
      throw new Error("User already in group");
    }

    await updateDoc(groupRef, {
      members: arrayUnion(userId),
      memberCount: increment(1),
    });
  } catch (error) {
    console.error("Error adding group member:", error);
    throw error;
  }
}

// Remove a member from a group
export async function removeGroupMember(groupId: string, userId: string) {
  try {
    const groupRef = doc(groupsRef, groupId);
    const groupSnap = await getDoc(groupRef);

    if (!groupSnap.exists()) {
      throw new Error("Group not found");
    }

    // Get member document to check role
    const q = query(getGroupMembersRef(groupId), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error("Member not found");
    }

    const memberDoc = querySnapshot.docs[0];
    const memberData = memberDoc.data();

    // Don't allow removing the last admin
    if (memberData.role === "Admin") {
      const adminQuery = query(
        getGroupMembersRef(groupId),
        where("role", "==", "Admin")
      );
      const adminSnapshot = await getDocs(adminQuery);

      if (adminSnapshot.size <= 1) {
        throw new Error("Cannot remove the last admin from the group");
      }
    }

    // Remove member from group's members array
    await updateDoc(groupRef, {
      members: arrayRemove(userId),
      memberCount: increment(-1),
      updatedAt: serverTimestamp(),
    });

    // Delete member document
    await deleteDoc(memberDoc.ref);
  } catch (error) {
    console.error("Error removing group member:", error);
    throw error;
  }
}

// Get the current user
export async function getCurrentUser() {
  const user = auth.currentUser;
  if (!user) return null;

  const userDoc = await getDoc(doc(db, "users", user.uid));

  if (!userDoc.exists()) return null;

  const userData = userDoc.data();
  return {
    ...user,
    id: user.uid,
    name: userData.name,
    email: userData.email,
    avatar: userData.avatar,
  };
}

// Get a member's role in a group
export async function getMemberRole(groupId: string, userId: string) {
  try {
    const q = query(getGroupMembersRef(groupId), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    return querySnapshot.docs[0].data().role as "Admin" | "Member";
  } catch (error) {
    console.error("Error getting member role:", error);
    throw error;
  }
}
