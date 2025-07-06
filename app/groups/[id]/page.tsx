"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadPhotoSimple } from "@/components/groups/sections/upload-photo-new";
import { GroupFeed } from "@/components/groups/sections/group-feed";
import { Navbar } from "@/components/layout/navbar";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";
import { getGroupById } from "@/lib/group-utils";
import { GroupSettings } from "@/components/groups/sections/group-settings-new";
import { GroupMembers } from "@/components/groups/sections/group-members";
import { useAuth } from "@/context/auth-context";
import type { Group } from "@/types/group";

export default function GroupPage() {
  const { id } = useParams();
  const router = useRouter();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState("feed");
  const { user } = useAuth();
  const { toast } = useToast();

  const handlePhotoUploaded = () => {
    // Trigger a refresh of the feed
    setRefreshKey((prev) => prev + 1);
    // Switch back to feed tab after upload
    setActiveTab("feed");
    // Also refresh the group data to update photo count
    if (group) {
      getGroupById(id as string).then((updatedGroup) => {
        if (updatedGroup) {
          setGroup(updatedGroup);
        }
      });
    }
  };

  const handleOpenUpload = () => {
    setActiveTab("upload");
  };

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        const groupData = await getGroupById(id as string);
        if (!groupData) {
          toast({
            title: "Group not found",
            description:
              "This group may have been deleted or you may not have access",
            variant: "destructive",
          });
          return;
        }

        // Check if user has access
        if (groupData.isPrivate && !groupData.memberIds.includes(user.uid)) {
          toast({
            title: "Access denied",
            description: "You do not have permission to view this group",
            variant: "destructive",
          });
          return;
        }

        setGroup(groupData);
      } catch {
        toast({
          title: "Error loading data",
          description: "Please try again later",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, user, toast]);

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-black pt-16 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto mb-4" />
            <p className="text-slate-400">Loading...</p>
          </div>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-black pt-16 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto mb-4" />
            <p className="text-slate-400">Loading group...</p>
          </div>
        </div>
      </>
    );
  }

  if (!group) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-black pt-16 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-2">
              Group not found
            </h1>
            <p className="text-slate-400">
              This group may have been deleted or you may not have access
            </p>
          </div>
        </div>
      </>
    );
  }

  // Determine user role in the group
  const isAdmin = group.adminIds.includes(user.uid);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black p-20">
        <div className="container mx-auto p-6 lg:p-8">
          {/* Group Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="flex items-center text-slate-400 hover:text-white transition mb-2"
                  aria-label="Back to Dashboard"
                >
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  <span className="arrowdashboard ">Back to Dashboard</span>
                </button>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {group.name}
                </h1>
                <p className="text-slate-400">
                  {group.memberCount} member{group.memberCount !== 1 ? "s" : ""}{" "}
                  • {group.photoCount} photo{group.photoCount !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400">Group Code</p>
                <p className="font-mono text-lg text-white">{group.code}</p>
              </div>
            </div>
          </motion.div>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <div className="sticky top-0 z-40 -mx-6 glass border-b border-white/10 px-6 py-4">
              <TabsList className="h-12 w-full justify-start glass border-white/10">
                <TabsTrigger value="feed" className="text-sm">
                  Feed
                </TabsTrigger>
                <TabsTrigger value="upload" className="text-sm">
                  Upload
                </TabsTrigger>
                <TabsTrigger value="map" className="text-sm">
                  Map
                </TabsTrigger>
                <TabsTrigger value="members" className="text-sm">
                  Members
                </TabsTrigger>
                {isAdmin && (
                  <TabsTrigger value="settings" className="text-sm">
                    Settings
                  </TabsTrigger>
                )}
              </TabsList>
            </div>

            <TabsContent value="feed" className="mt-6">
              <GroupFeed
                key={refreshKey}
                group={group}
                onOpenUpload={handleOpenUpload}
              />
            </TabsContent>

            <TabsContent value="upload" className="mt-6">
              <UploadPhotoSimple
                group={group}
                onPhotoUploaded={handlePhotoUploaded}
              />
            </TabsContent>

            <TabsContent value="map" className="mt-6">
              <div className="text-center py-8">
                <p className="text-slate-400">Map section coming soon...</p>
              </div>
            </TabsContent>

            <TabsContent value="members" className="mt-6">
              <GroupMembers group={group} onGroupUpdated={setGroup} />
            </TabsContent>

            {isAdmin && (
              <TabsContent value="settings" className="mt-6">
                <GroupSettings
                  group={group}
                  onGroupUpdated={setGroup}
                  onGroupDeleted={() => router.push("/dashboard")}
                  onLeaveGroup={() => router.push("/dashboard")}
                />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </>
  );
}
