import { collection, getDocs, deleteDoc} from "firebase/firestore";

import { db} from "./firebase";

// Delete all groups and their data
export async function deleteAllGroups() {
  try {
    console.log("Starting cleanup of all groups...");

    // Get all groups
    const groupsRef = collection(db, "groups");
    const groupsSnapshot = await getDocs(groupsRef);

    console.log(`Found ${groupsSnapshot.size} groups to delete`);

    for (const groupDoc of groupsSnapshot.docs) {
      const groupId = groupDoc.id;
      console.log(`Deleting group: ${groupId}`);

      // Delete all photos subcollection documents
      try {
        const photosRef = collection(db, `groups/${groupId}/photos`);
        const photosSnapshot = await getDocs(photosRef);

        console.log(
          `Deleting ${photosSnapshot.size} photo documents for group ${groupId}`
        );

        for (const photoDoc of photosSnapshot.docs) {
          await deleteDoc(photoDoc.ref);
        }
      } catch (firestoreError) {
        console.warn(
          `Error deleting photo documents for group ${groupId}:`,
          firestoreError
        );
      }

      // Delete all members subcollection documents
      try {
        const membersRef = collection(db, `groups/${groupId}/members`);
        const membersSnapshot = await getDocs(membersRef);

        console.log(
          `Deleting ${membersSnapshot.size} member documents for group ${groupId}`
        );

        for (const memberDoc of membersSnapshot.docs) {
          await deleteDoc(memberDoc.ref);
        }
      } catch (firestoreError) {
        console.warn(
          `Error deleting member documents for group ${groupId}:`,
          firestoreError
        );
      }

      // Finally delete the group document
      await deleteDoc(groupDoc.ref);
      console.log(`Deleted group document: ${groupId}`);
    }

    console.log("Cleanup completed successfully!");
    return true;
  } catch (error) {
    console.error("Error during cleanup:", error);
    throw error;
  }
}


