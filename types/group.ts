import type { Timestamp, FieldValue } from "firebase/firestore";

export interface Group {
  id: string;
  name: string;
  code: string;
  isPrivate: boolean;
  allowJoinRequests: boolean;
  creatorId: string;
  adminIds: string[];
  memberIds: string[];
  memberCount: number;
  photoCount: number;
  role: "Admin" | "Member";
  recentPhotos: string[];
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
}

export type CreateGroupInput = {
  name: string;
  isPrivate: boolean;
  allowJoinRequests?: boolean;
};

export interface JoinRequest {
  id: string;
  groupId: string;
  userId: string;
  userEmail: string;
  userDisplayName: string;
  userPhotoURL?: string;
  message?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
}

export type CreateJoinRequestInput = {
  groupId: string;
  userId: string;
  message?: string;
};
