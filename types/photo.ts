export interface Comment {
  id: string;
  userId: string;
  user?: {
    displayName: string;
    email?: string;
    photoURL?: string;
  };
  text: string;
  createdAt: any; // Firebase Timestamp
}

export interface Photo {
  id: string;
  url: string; // This will be the base64 data URL for display
  imageData: string; // Base64 encoded image data
  filename: string;
  originalName: string;
  fileSize: number;
  compressedSize: number; // Size after compression
  fileType: string;
  userId: string;
  user?: {
    displayName: string;
    email?: string;
    photoURL?: string;
  };
  description: string;
  location: string;
  tags: string[];
  likes: string[];
  likeCount: number;
  comments?: Comment[];
  commentCount: number;
  createdAt: any; // Firebase Timestamp
  uploadDate: string; // YYYY-MM-DD format for easy date queries
  month: number; // 1-12 for month-based queries
  year: number; // Year for year-based queries
}
