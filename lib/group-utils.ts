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
  arrayUnion,
  arrayRemove,
  increment,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "./firebase";
import type {
  Group,
  CreateGroupInput,
  JoinRequest,
  CreateJoinRequestInput,
} from "@/types/group";
import { getOrCreateUserProfile } from "./user-utils";

// Collections
const groupsRef = collection(db, "groups");

// Helper function to get join requests collection
const getJoinRequestsRef = (groupId: string) =>
  collection(db, `groups/${groupId}/joinRequests`);

// Generate unique 6-character group code
export async function generateGroupCode(): Promise<string> {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  while (true) {
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    // Check if code is unique
    const existingGroup = await getGroupByCode(code);
    if (!existingGroup) {
      return code;
    }
  }
}

// Create a new group
export async function createGroup(
  data: CreateGroupInput,
  userId: string
): Promise<Group> {
  try {
    const code = await generateGroupCode();

    const groupData = {
      name: data.name.trim(),
      code,
      isPrivate: data.isPrivate,
      allowJoinRequests: data.allowJoinRequests ?? false,
      creatorId: userId,
      adminIds: [userId],
      memberIds: [userId],
      memberCount: 1,
      photoCount: 0,
      recentPhotos: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(groupsRef, groupData);

    return {
      id: docRef.id,
      role: "Admin",
      ...groupData,
    } as Group;
  } catch (error) {
    console.error("Error creating group:", error);
    throw error;
  }
}

// Get group by code
export async function getGroupByCode(code: string): Promise<Group | null> {
  try {
    const q = query(groupsRef, where("code", "==", code.toUpperCase()));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Group;
  } catch (error) {
    console.error("Error getting group by code:", error);
    throw error;
  }
}

// Get group by ID
export async function getGroupById(groupId: string): Promise<Group | null> {
  try {
    const docRef = doc(groupsRef, groupId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    return { id: docSnap.id, ...docSnap.data() } as Group;
  } catch (error) {
    console.error("Error getting group by ID:", error);
    throw error;
  }
}

// Get user's groups
export async function getUserGroups(userId: string): Promise<Group[]> {
  try {
    const q = query(groupsRef, where("memberIds", "array-contains", userId));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Group[];
  } catch (error) {
    console.error("Error getting user groups:", error);
    throw error;
  }
}

// Join group
export async function joinGroup(
  groupId: string,
  userId: string
): Promise<void> {
  try {
    const groupRef = doc(groupsRef, groupId);
    const groupSnap = await getDoc(groupRef);

    if (!groupSnap.exists()) {
      throw new Error("Group not found");
    }

    const groupData = groupSnap.data();

    if (groupData.memberIds?.includes(userId)) {
      throw new Error("Already a member of this group");
    }

    await updateDoc(groupRef, {
      memberIds: arrayUnion(userId),
      memberCount: increment(1),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error joining group:", error);
    throw error;
  }
}

// Leave group
export async function leaveGroup(
  groupId: string,
  userId: string
): Promise<void> {
  try {
    const groupRef = doc(groupsRef, groupId);
    const groupSnap = await getDoc(groupRef);

    if (!groupSnap.exists()) {
      throw new Error("Group not found");
    }

    const groupData = groupSnap.data();

    if (!groupData.memberIds?.includes(userId)) {
      throw new Error("Not a member of this group");
    }

    // Check if user is the only admin
    if (
      groupData.adminIds?.includes(userId) &&
      groupData.adminIds.length === 1 &&
      groupData.memberCount > 1
    ) {
      throw new Error(
        "Cannot leave group as the only admin. Transfer admin role first."
      );
    }

    await updateDoc(groupRef, {
      memberIds: arrayRemove(userId),
      adminIds: arrayRemove(userId),
      memberCount: increment(-1),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error leaving group:", error);
    throw error;
  }
}

// Update group settings
export async function updateGroupSettings(
  groupId: string,
  updates: Partial<Pick<Group, "name" | "isPrivate" | "allowJoinRequests">>,
  userId: string
): Promise<void> {
  try {
    const group = await getGroupById(groupId);

    if (!group) {
      throw new Error("Group not found");
    }

    if (!isUserAdmin(group, userId)) {
      throw new Error("Only admins can update group settings");
    }

    const groupRef = doc(groupsRef, groupId);
    await updateDoc(groupRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating group settings:", error);
    throw error;
  }
}

// Remove member from group (admin only)
export async function removeMember(
  groupId: string,
  memberIdToRemove: string,
  adminUserId: string
): Promise<void> {
  try {
    const group = await getGroupById(groupId);

    if (!group) {
      throw new Error("Group not found");
    }

    if (!isUserAdmin(group, adminUserId)) {
      throw new Error("Only admins can remove members");
    }

    if (memberIdToRemove === group.creatorId) {
      throw new Error("Cannot remove the group creator");
    }

    if (memberIdToRemove === adminUserId) {
      throw new Error("Cannot remove yourself. Use leave group instead");
    }

    const groupRef = doc(groupsRef, groupId);
    await updateDoc(groupRef, {
      memberIds: arrayRemove(memberIdToRemove),
      adminIds: arrayRemove(memberIdToRemove), // Remove from admin too if they were admin
      memberCount: increment(-1),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error removing member:", error);
    throw error;
  }
}

// Toggle admin role (admin only)
export async function toggleAdminRole(
  groupId: string,
  targetUserId: string,
  adminUserId: string,
  makeAdmin: boolean
): Promise<void> {
  try {
    const group = await getGroupById(groupId);

    if (!group) {
      throw new Error("Group not found");
    }

    if (!isUserAdmin(group, adminUserId)) {
      throw new Error("Only admins can change member roles");
    }

    // Cannot change your own role unless you're the creator
    if (targetUserId === adminUserId && group.creatorId !== adminUserId) {
      throw new Error("You cannot change your own admin status");
    }

    const groupRef = doc(groupsRef, groupId);

    if (makeAdmin) {
      await updateDoc(groupRef, {
        adminIds: arrayUnion(targetUserId),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(groupRef, {
        adminIds: arrayRemove(targetUserId),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error("Error toggling admin role:", error);
    throw error;
  }
}

// Check if user is admin
export function isUserAdmin(group: Group, userId: string): boolean {
  return group.adminIds?.includes(userId) ?? false;
}

// Check if user is member
export function isUserMember(group: Group, userId: string): boolean {
  return group.memberIds?.includes(userId) ?? false;
}

// Delete group (admin only)
export async function deleteGroup(
  groupId: string,
  userId: string
): Promise<void> {
  try {
    const group = await getGroupById(groupId);

    if (!group) {
      throw new Error("Group not found");
    }

    if (!isUserAdmin(group, userId)) {
      throw new Error("Only admins can delete groups");
    }

    // TODO: Delete all photos from storage
    // TODO: Delete all subcollections

    // Delete the group document
    await deleteDoc(doc(groupsRef, groupId));
  } catch (error) {
    console.error("Error deleting group:", error);
    throw error;
  }
}

// ==================== JOIN REQUEST FUNCTIONS ====================

/**
 * Submit a join request to a group
 */
export async function submitJoinRequest(
  data: CreateJoinRequestInput
): Promise<JoinRequest> {
  try {
    const { groupId, userId, message } = data;

    // Get group to validate it exists and allows join requests
    const group = await getGroupById(groupId);
    if (!group) {
      throw new Error("Group not found");
    }

    if (!group.allowJoinRequests) {
      throw new Error("This group does not allow join requests");
    }

    // Check if user is already a member
    if (group.memberIds.includes(userId)) {
      throw new Error("You are already a member of this group");
    }

    // Check if there's already a pending request
    const existingRequest = await getExistingJoinRequest(groupId, userId);
    if (existingRequest && existingRequest.status === "pending") {
      throw new Error("You already have a pending request for this group");
    }

    // Get user profile for the request
    const userProfile = await getOrCreateUserProfile(userId);
    if (!userProfile) {
      throw new Error("User profile not found");
    }

    // Create the join request
    const joinRequestData = {
      groupId,
      userId,
      userEmail: userProfile.email,
      userDisplayName: userProfile.displayName,
      userPhotoURL: userProfile.photoURL,
      message: message?.trim() || "",
      status: "pending" as const,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const joinRequestsRef = getJoinRequestsRef(groupId);
    const docRef = await addDoc(joinRequestsRef, joinRequestData);

    return {
      id: docRef.id,
      ...joinRequestData,
    } as JoinRequest;
  } catch (error) {
    console.error("Error submitting join request:", error);
    throw error;
  }
}

/**
 * Get all join requests for a group (admin only)
 */
export async function getGroupJoinRequests(
  groupId: string,
  adminUserId: string
): Promise<JoinRequest[]> {
  try {
    // Verify admin permissions
    const group = await getGroupById(groupId);
    if (!group || !isUserAdmin(group, adminUserId)) {
      throw new Error("Only group admins can view join requests");
    }

    const joinRequestsRef = getJoinRequestsRef(groupId);
    const q = query(
      joinRequestsRef,
      where("status", "==", "pending"),
      orderBy("createdAt", "desc"),
      limit(50)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as JoinRequest[];
  } catch (error) {
    console.error("Error getting join requests:", error);
    throw error;
  }
}

/**
 * Approve a join request
 */
export async function approveJoinRequest(
  groupId: string,
  requestId: string,
  adminUserId: string
): Promise<void> {
  try {
    // Verify admin permissions
    const group = await getGroupById(groupId);
    if (!group || !isUserAdmin(group, adminUserId)) {
      throw new Error("Only group admins can approve join requests");
    }

    // Get the join request
    const requestRef = doc(getJoinRequestsRef(groupId), requestId);
    const requestSnap = await getDoc(requestRef);

    if (!requestSnap.exists()) {
      throw new Error("Join request not found");
    }

    const joinRequest = requestSnap.data() as JoinRequest;

    if (joinRequest.status !== "pending") {
      throw new Error("Join request is no longer pending");
    }

    // Check if user is already a member (race condition protection)
    if (group.memberIds.includes(joinRequest.userId)) {
      // Update request status to approved and return
      await updateDoc(requestRef, {
        status: "approved",
        updatedAt: serverTimestamp(),
      });
      return;
    }

    // Add user to group
    const groupRef = doc(groupsRef, groupId);
    await updateDoc(groupRef, {
      memberIds: arrayUnion(joinRequest.userId),
      memberCount: increment(1),
      updatedAt: serverTimestamp(),
    });

    // Update request status
    await updateDoc(requestRef, {
      status: "approved",
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error approving join request:", error);
    throw error;
  }
}

/**
 * Reject a join request
 */
export async function rejectJoinRequest(
  groupId: string,
  requestId: string,
  adminUserId: string
): Promise<void> {
  try {
    // Verify admin permissions
    const group = await getGroupById(groupId);
    if (!group || !isUserAdmin(group, adminUserId)) {
      throw new Error("Only group admins can reject join requests");
    }

    // Update request status
    const requestRef = doc(getJoinRequestsRef(groupId), requestId);
    await updateDoc(requestRef, {
      status: "rejected",
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error rejecting join request:", error);
    throw error;
  }
}

/**
 * Check if user has an existing join request for a group
 */
export async function getExistingJoinRequest(
  groupId: string,
  userId: string
): Promise<JoinRequest | null> {
  try {
    const joinRequestsRef = getJoinRequestsRef(groupId);
    const q = query(
      joinRequestsRef,
      where("userId", "==", userId),
      where("status", "==", "pending"),
      limit(1)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as JoinRequest;
  } catch (error) {
    console.error("Error checking existing join request:", error);
    return null;
  }
}

/**
 * Get join request count for a group
 */
export async function getJoinRequestCount(groupId: string): Promise<number> {
  try {
    const joinRequestsRef = getJoinRequestsRef(groupId);
    const q = query(joinRequestsRef, where("status", "==", "pending"));
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error("Error getting join request count:", error);
    return 0;
  }
}
