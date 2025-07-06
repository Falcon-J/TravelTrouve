"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GroupSidebar } from "../layout/group-sidebar";
import { GroupFeed } from "./sections/group-feed";
import { UploadPhotoSimple } from "./sections/upload-photo-new";
import { GroupMembers } from "./sections/group-members";
import { MapView } from "./sections/map-view";
import { GroupSettings } from "./sections/group-settings-new";
import type { Group } from "@/types/group";
import type { AppUser } from "@/types/user";
interface GroupViewProps {
  group: Group;
  currentUser: AppUser;
}

export type GroupViewType = "feed" | "upload" | "members" | "map" | "settings";

export function GroupView({ group}: GroupViewProps) {
  const [activeView, setActiveViewAction] = useState<GroupViewType>("feed");
  const [sidebarOpen, setSidebarOpenAction] = useState(false);

  const renderContent = () => {
    const pageVariants = {
      initial: { opacity: 0, y: 10 },
      in: { opacity: 1, y: 0 },
      out: { opacity: 0, y: -10 },
    };

    const pageTransition: import("framer-motion").Transition = {
      type: "spring",
      stiffness: 260,
      damping: 20,
    };

    const ContentWrapper = ({ children }: { children: React.ReactNode }) => (
      <motion.div
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className="bg-slate-900/95 backdrop-blur-xl rounded-xl p-4 shadow-lg border border-slate-800"
      >
        {children}
      </motion.div>
    );

    switch (activeView) {
      case "feed":
        return (
          <ContentWrapper key="feed">
            <GroupFeed
              group={group}
              onOpenUpload={() => setActiveViewAction("upload")}
            />
          </ContentWrapper>
        );
      case "upload":
        return (
          <ContentWrapper key="upload">
            <UploadPhotoSimple
              group={group}
              onPhotoUploaded={() => setActiveViewAction("feed")}
            />
          </ContentWrapper>
        );
      case "members":
        return (
          <ContentWrapper key="members">
            <GroupMembers group={group} />
          </ContentWrapper>
        );
      case "map":
        return (
          <ContentWrapper key="map">
            <MapView  />
          </ContentWrapper>
        );
      case "settings":
        return (
          <ContentWrapper key="settings">
            <GroupSettings group={group} />
          </ContentWrapper>
        );
      default:
        return (
          <ContentWrapper key="default">
            <GroupFeed
              group={group}
              onOpenUpload={() => setActiveViewAction("upload")}
            />
          </ContentWrapper>
        );
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] ">
      <GroupSidebar
        group={group}
        // currentUser={currentUser}
        activeView={activeView}
        setActiveViewAction={setActiveViewAction}
        sidebarOpen={sidebarOpen}
        setSidebarOpenAction={setSidebarOpenAction}
      />

      <main className="flex-1 relative w-full lg:p-8">
        <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          <div className="p-4 lg:p-6 max-w-7xl mx-auto">
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-white tracking-tight mb-1">
                    {activeView === "feed"
                      ? group.name
                      : `${group.name} - ${
                          activeView.charAt(0).toUpperCase() +
                          activeView.slice(1)
                        }`}
                  </h1>
                  <div className="flex items-center text-slate-400 text-sm">
                    <span className="flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span>
                      {group.memberCount} member
                      {group.memberCount !== 1 ? "s" : ""}
                    </span>
                    <span className="mx-2">•</span>
                    <span className="flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></span>
                      {group.photoCount} photo
                      {group.photoCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
          </div>
        </div>
      </main>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpenAction(false)}
        />
      )}
    </div>
  );
}
