import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  orderBy,
  where,
  limit,
  startAfter,
  serverTimestamp,
  arrayUnion,
  increment,
} from "firebase/firestore";
import { db } from "./firebase";
import { getGroupById } from "./group-utils";
import { getUserDisplayNames } from "./user-utils";
import type { Photo, Comment } from "@/types/photo";

/**
 * Enrich photos with user display names
 */
async function enrichPhotosWithUserInfo(photos: Photo[]): Promise<Photo[]> {
  if (photos.length === 0) return photos;

  // Get unique user IDs
  const userIds = [...new Set(photos.map((photo) => photo.userId))];

  // Fetch display names for all users
  const userDisplayNames = await getUserDisplayNames(userIds);

  // Enrich photos with user information
  return photos.map((photo) => ({
    ...photo,
    user: {
      displayName: userDisplayNames[photo.userId] || photo.userId.slice(0, 8),
    },
  }));
}

// Helper function to convert file to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

// Helper function to compress image for Firestore
function compressImage(
  file: File,
  maxSize: number = 800 * 1024 // 800KB to stay well under Firestore 1MB limit
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      // More aggressive sizing for Firestore
      const maxDimension = 800; // Reduced from 1200 to 800
      let { width, height } = img;

      if (width > height) {
        if (width > maxDimension) {
          height = (height * maxDimension) / width;
          width = maxDimension;
        }
      } else {
        if (height > maxDimension) {
          width = (width * maxDimension) / height;
          height = maxDimension;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);

      // Start with medium quality for better compression
      let quality = 0.7; // Reduced from 0.8
      let result = canvas.toDataURL("image/jpeg", quality);

      // More aggressive quality reduction if needed
      while (result.length > maxSize && quality > 0.1) {
        quality -= 0.05; // Smaller steps for finer control
        result = canvas.toDataURL("image/jpeg", quality);
      }

      // Final check - if still too large, reject
      if (result.length > maxSize) {
        reject(
          new Error("Unable to compress image small enough for Firestore")
        );
        return;
      }

      resolve(result);
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

// Upload photo to group
export async function uploadPhotoToGroup(
  groupId: string,
  userId: string,
  file: File,
  metadata: {
    description?: string;
    location?: string;
    tags?: string[];
  }
): Promise<Photo> {
  try {
    // First, validate that file exists
    if (!file) {
      throw new Error("No file provided. Please select a file to upload.");
    }

    // Validate file object properties
    if (file.name === undefined || file.size === undefined) {
      throw new Error(
        "Invalid file object. Please try selecting the file again."
      );
    }

    // Verify user is member of group
    const group = await getGroupById(groupId);
    if (!group || !group.memberIds.includes(userId)) {
      throw new Error("Not authorized to upload to this group");
    }

    // Check file size (limit to 2MB due to Firestore document size constraints)
    const maxSize = 2 * 1024 * 1024; // 2MB - more conservative for Firestore
    if (file.size > maxSize) {
      throw new Error("File size too large. Please choose a file under 2MB.");
    }

    // Check file type - be more permissive with validation
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/jfif", // Some browsers report JPEG as this
      "image/pjpeg", // Progressive JPEG
      "", // Handle empty MIME type
    ];

    // Also check file extension as fallback
    const fileExtension = file.name?.split(".").pop()?.toLowerCase();
    const allowedExtensions = ["jpg", "jpeg", "png", "webp", "jfif"];

    // Debug: Log the actual file type being detected
    console.log("=== FILE VALIDATION DEBUG ===");
    console.log("File details:", {
      name: file.name,
      type: file.type,
      typeLength: file.type?.length,
      extension: fileExtension,
      size: file.size,
    });
    console.log("Type check result:", allowedTypes.includes(file.type));
    console.log(
      "Extension check result:",
      fileExtension && allowedExtensions.includes(fileExtension)
    );

    const isValidType = allowedTypes.includes(file.type);
    const isValidExtension =
      fileExtension && allowedExtensions.includes(fileExtension);

    // More permissive validation - pass if either type OR extension is valid, or if it's an image file
    const isImageFile = file.type?.startsWith("image/") || false;

    console.log("Final validation:", {
      isValidType,
      isValidExtension,
      isImageFile,
      willPass: isValidType || isValidExtension || isImageFile,
    });

    if (!isValidType && !isValidExtension && !isImageFile) {
      throw new Error(
        `Invalid file type: "${file.type}" (${fileExtension}). Please upload a JPEG, PNG, or WebP image.`
      );
    }

    console.log("Processing photo for Firestore storage...");

    // Convert and compress image with Firestore size constraints
    let imageData: string;
    try {
      imageData = await compressImage(file);
      console.log(
        "Image compressed successfully, size:",
        imageData.length,
        "bytes"
      );

      // Double-check Firestore document size limit (1MB = ~1.33MB base64)
      const estimatedDocSize = imageData.length + 1000; // Add buffer for other fields
      if (estimatedDocSize > 1000000) {
        // 1MB in bytes
        throw new Error("Compressed image still too large for Firestore");
      }
    } catch (error) {
      console.error("Image compression failed:", error);
      throw new Error(
        "Unable to process image for Firestore storage. Please try a smaller image."
      );
    }

    // Generate unique filename for reference
    const timestamp = Date.now();
    const extension = file.name?.split(".").pop() || "jpg";
    const filename = `${timestamp}-${Math.random()
      .toString(36)
      .substring(7)}.${extension}`;

    // Create photo document with image data optimized for Firestore
    const photoData = {
      imageData, // Store the compressed image as base64
      filename,
      originalName: file.name,
      fileSize: file.size,
      compressedSize: imageData.length,
      fileType: file.type,
      userId,
      description: metadata.description || "",
      location: metadata.location || "",
      tags: metadata.tags || [],
      likes: [],
      likeCount: 0,
      commentCount: 0,
      createdAt: serverTimestamp(),
      // Add fields for better Firestore querying
      uploadDate: new Date().toISOString().split("T")[0], // YYYY-MM-DD for date queries
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    };

    console.log("Creating photo document in Firestore...");

    // Add to Firestore with error handling for size limits
    const photosRef = collection(db, `groups/${groupId}/photos`);
    let docRef;

    try {
      docRef = await addDoc(photosRef, photoData);
      console.log("Photo document created:", docRef.id);
    } catch (error: any) {
      if (
        error.code === "invalid-argument" &&
        error.message.includes("too large")
      ) {
        throw new Error(
          "Image data too large for Firestore. Please try a smaller image."
        );
      }
      throw error;
    }

    // Update group with new photo
    const groupRef = doc(db, "groups", groupId);
    await updateDoc(groupRef, {
      photoCount: increment(1),
      recentPhotos: arrayUnion(docRef.id), // Store document ID instead of URL
      updatedAt: serverTimestamp(),
    });

    return {
      id: docRef.id,
      url: imageData, // Use imageData as URL for display
      ...photoData,
    } as Photo;
  } catch (error) {
    console.error("Error uploading photo:", error);
    throw error;
  }
}

// Get photos for a group with pagination (better for Firestore performance)
export async function getGroupPhotos(
  groupId: string,
  pageSize: number = 20,
  lastVisible?: any
): Promise<{ photos: Photo[]; lastVisible: any; hasMore: boolean }> {
  try {
    const photosRef = collection(db, `groups/${groupId}/photos`);
    let q = query(photosRef, orderBy("createdAt", "desc"));

    if (lastVisible) {
      q = query(q, startAfter(lastVisible));
    }

    q = query(q, limit(pageSize + 1)); // Get one extra to check if there are more

    const snapshot = await getDocs(q);
    const rawPhotos = snapshot.docs.slice(0, pageSize).map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Photo[];

    // Enrich photos with user information
    const photos = await enrichPhotosWithUserInfo(rawPhotos);

    const hasMore = snapshot.docs.length > pageSize;
    const newLastVisible =
      photos.length > 0 ? snapshot.docs[photos.length - 1] : null;

    return { photos, lastVisible: newLastVisible, hasMore };
  } catch (error) {
    console.error("Error getting group photos:", error);
    throw error;
  }
}

// Simple version for backward compatibility
export async function getAllGroupPhotos(groupId: string): Promise<Photo[]> {
  const result = await getGroupPhotos(groupId, 100); // Get up to 100 photos
  return result.photos;
}

// Delete photo
export async function deletePhoto(
  groupId: string,
  photoId: string,
  userId: string
): Promise<void> {
  try {
    // Get photo document
    const photoRef = doc(db, `groups/${groupId}/photos`, photoId);
    const photoSnap = await getDoc(photoRef);

    if (!photoSnap.exists()) {
      throw new Error("Photo not found");
    }

    const photoData = photoSnap.data();

    // Check if user can delete (owner or group admin)
    const group = await getGroupById(groupId);
    const canDelete =
      photoData.userId === userId || group?.adminIds?.includes(userId);

    if (!canDelete) {
      throw new Error("Not authorized to delete this photo");
    }

    // Delete from Firestore (no storage cleanup needed since data is in Firestore)
    await deleteDoc(photoRef);

    // Update group photo count
    const groupRef = doc(db, "groups", groupId);
    await updateDoc(groupRef, {
      photoCount: increment(-1),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error deleting photo:", error);
    throw error;
  }
}

// Like/unlike photo
export async function togglePhotoLike(
  groupId: string,
  photoId: string,
  userId: string
): Promise<void> {
  try {
    const photoRef = doc(db, `groups/${groupId}/photos`, photoId);
    const photoSnap = await getDoc(photoRef);

    if (!photoSnap.exists()) {
      throw new Error("Photo not found");
    }

    const photoData = photoSnap.data();
    const likes = photoData.likes || [];
    const hasLiked = likes.includes(userId);

    if (hasLiked) {
      // Unlike
      await updateDoc(photoRef, {
        likes: likes.filter((id: string) => id !== userId),
        likeCount: Math.max(0, (photoData.likeCount || 0) - 1),
      });
    } else {
      // Like
      await updateDoc(photoRef, {
        likes: [...likes, userId],
        likeCount: (photoData.likeCount || 0) + 1,
      });
    }
  } catch (error) {
    console.error("Error toggling photo like:", error);
    throw error;
  }
}

// Get photos by date range (helpful for Firestore queries)
export async function getPhotosByDateRange(
  groupId: string,
  startDate: string, // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
): Promise<Photo[]> {
  try {
    const photosRef = collection(db, `groups/${groupId}/photos`);

    const q = query(
      photosRef,
      where("uploadDate", ">=", startDate),
      where("uploadDate", "<=", endDate),
      orderBy("uploadDate", "desc")
    );

    const snapshot = await getDocs(q);
    const rawPhotos = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Photo[];

    // Enrich photos with user information
    return await enrichPhotosWithUserInfo(rawPhotos);
  } catch (error) {
    console.error("Error getting photos by date range:", error);
    throw error;
  }
}

// Get photos by user (helpful for user's photo gallery)
export async function getUserPhotosInGroup(
  groupId: string,
  userId: string,
  pageSize: number = 20
): Promise<Photo[]> {
  try {
    const photosRef = collection(db, `groups/${groupId}/photos`);

    const q = query(
      photosRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(pageSize)
    );

    const snapshot = await getDocs(q);
    const rawPhotos = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Photo[];

    // Enrich photos with user information
    return await enrichPhotosWithUserInfo(rawPhotos);
  } catch (error) {
    console.error("Error getting user photos:", error);
    throw error;
  }
}

/**
 * Add a comment to a photo
 */
export async function addCommentToPhoto(
  groupId: string,
  photoId: string,
  userId: string,
  text: string
): Promise<Comment> {
  try {
    if (!text.trim()) {
      throw new Error("Comment text cannot be empty");
    }

    // Create the comment object
    const comment: Omit<Comment, "id"> = {
      userId,
      text: text.trim(),
      createdAt: serverTimestamp(),
    };

    // Add the comment to the photo's comments subcollection
    const commentsRef = collection(
      db,
      `groups/${groupId}/photos/${photoId}/comments`
    );
    const commentDoc = await addDoc(commentsRef, comment);

    // Update the photo's comment count
    const photoRef = doc(db, `groups/${groupId}/photos/${photoId}`);
    await updateDoc(photoRef, {
      commentCount: increment(1),
    });

    // Get user display name
    const userDisplayNames = await getUserDisplayNames([userId]);

    // Return the comment with the generated ID and user info
    return {
      id: commentDoc.id,
      ...comment,
      user: {
        displayName: userDisplayNames[userId] || userId.slice(0, 8),
      },
    } as Comment;
  } catch (error) {
    console.error("Error adding comment:", error);
    throw error;
  }
}

/**
 * Get comments for a photo
 */
export async function getPhotoComments(
  groupId: string,
  photoId: string,
  pageSize: number = 20
): Promise<Comment[]> {
  try {
    const commentsRef = collection(
      db,
      `groups/${groupId}/photos/${photoId}/comments`
    );
    const q = query(commentsRef, orderBy("createdAt", "desc"), limit(pageSize));

    const snapshot = await getDocs(q);
    const rawComments = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Comment[];

    // Get unique user IDs
    const userIds = [...new Set(rawComments.map((comment) => comment.userId))];

    // Fetch display names for all users
    const userDisplayNames = await getUserDisplayNames(userIds);

    // Enrich comments with user information
    return rawComments.map((comment) => ({
      ...comment,
      user: {
        displayName:
          userDisplayNames[comment.userId] || comment.userId.slice(0, 8),
      },
    }));
  } catch (error) {
    console.error("Error getting photo comments:", error);
    throw error;
  }
}

/**
 * Delete a comment from a photo
 */
export async function deleteComment(
  groupId: string,
  photoId: string,
  commentId: string,
  userId: string
): Promise<void> {
  try {
    // Get the comment to check ownership
    const commentRef = doc(
      db,
      `groups/${groupId}/photos/${photoId}/comments/${commentId}`
    );
    const commentSnap = await getDoc(commentRef);

    if (!commentSnap.exists()) {
      throw new Error("Comment not found");
    }

    const comment = commentSnap.data();
    if (comment.userId !== userId) {
      throw new Error("You can only delete your own comments");
    }

    // Delete the comment
    await deleteDoc(commentRef);

    // Update the photo's comment count
    const photoRef = doc(db, `groups/${groupId}/photos/${photoId}`);
    await updateDoc(photoRef, {
      commentCount: increment(-1),
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    throw error;
  }
}
