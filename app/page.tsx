"use client";

// import { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { Navbar } from "@/components/layout/navbar";
// import { Dashboard } from "@/components/dashboard";
// import { GroupView } from "@/components/groups/group-view";
// import { ProfileView } from "@/components/profile-view";
import HeroPage from "./hero/page";

export interface Group {
  id: string;
  name: string;
  code: string;
  memberCount: number;
  role: "Admin" | "Member";
  recentPhotos: string[];
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role?: "Admin" | "Member";
  bio?: string;
  location?: string;
  joinedDate?: string;
  totalPhotos?: number;
  totalGroups?: number;
}

export interface Photo {
  id: string;
  src: string;
  caption: string;
  location: string;
  timestamp: string;
  author: User;
  reactions: { emoji: string; count: number }[];
  commentCount: number;
  tags: string[];
}

// Default user - in a real app, this would come from authentication


export type ViewType = "dashboard" | "group" | "profile";

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      <main>
        <HeroPage />
      </main>
    </div>
  );
}
