"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Users,
  Search,
  Camera,
  Sparkles,
 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { getUserGroups } from "@/lib/group-utils";
import { CreateGroupModal } from "@/components/groups/modals/create-group-modal-new";
import { JoinGroupModal } from "@/components/groups/modals/join-group-modal-new";
import { GroupCard } from "@/components/groups/group-card";
import { Navbar } from "@/components/layout/navbar";
import type { Group } from "@/types/group";

export default function DashboardPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchGroups = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const userGroups = await getUserGroups(user.uid);
        setGroups(userGroups);
        setFilteredGroups(userGroups);
      } catch (error) {
        console.error("Error fetching groups:", error);
        toast({
          title: "Error loading groups",
          description: "Failed to load your groups. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [user, toast]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = groups.filter((group) =>
        group.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredGroups(filtered);
    } else {
      setFilteredGroups(groups);
    }
  }, [searchTerm, groups]);

  const handleGroupCreated = (newGroup: Group) => {
    setGroups((prev) => [newGroup, ...prev]);
    setFilteredGroups((prev) => [newGroup, ...prev]);
  };

  const handleGroupJoined = (joinedGroup: Group) => {
    setGroups((prev) => {
      const exists = prev.some((g) => g.id === joinedGroup.id);
      if (exists) return prev;
      const updated = [joinedGroup, ...prev];
      setFilteredGroups(updated);
      return updated;
    });
  };

  const handleEnterGroup = (group: Group) => {
    window.location.href = `/groups/${group.id}`;
  };

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-black pt-16">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20" />
          <div className="relative flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-md mx-auto"
            >
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-white/5 rounded-full blur-xl" />
                <Camera className="relative h-16 w-16 text-blue-400 mx-auto" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-4">
                Welcome to TravelTrouve
              </h1>
              <p className="text-slate-400 mb-8">
                Please log in to view your travel groups and memories
              </p>
              <Button
                onClick={() => (window.location.href = "/login")}
                className="bg-slate-800/50 border border-white/10 hover:bg-slate-700/50 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-white/10"
              >
                Sign In
              </Button>
            </motion.div>
          </div>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-black pt-16">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20" />
          <div className="relative flex items-center justify-center min-h-[calc(100vh-4rem)]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-white/5 rounded-full blur-lg" />
                <div className="relative h-12 w-12 mx-auto">
                  <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-400 border-t-transparent" />
                </div>
              </div>
              <p className="text-slate-400">Loading your groups...</p>
            </motion.div>
          </div>
        </div>
      </>
    );
  }


  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black pt-16">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20" />

        {/* Content */}
        <div className="relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Welcome Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold text-white mb-4">
                  Welcome back, {user.displayName?.split(" ")[0] || "Traveler"}!
                  <Sparkles className="inline h-8 w-8 text-yellow-400 ml-2" />
                </h2>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                  Capture and share your travel memories with friends and
                  family. Create groups for your adventures and relive those
                  amazing moments.
                </p>
              </div>
            </motion.div>



            {/* Action Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-8"
            >
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-slate-800/50 border border-white/10 hover:bg-slate-700/50 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-white/10"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Create Group
                  </Button>

                  <Button
                    onClick={() => setShowJoinModal(true)}
                    variant="outline"
                    className="border-white/10 text-slate-300 hover:bg-white/10 hover:text-white px-6 py-3 rounded-xl font-medium transition-all duration-200"
                  >
                    <Users className="mr-2 h-5 w-5" />
                    Join Group
                  </Button>
                </div>

                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    placeholder="Search your groups..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 glass border-white/10 text-white placeholder:text-slate-400 rounded-xl focus:border-blue-400 transition-colors"
                  />
                </div>
              </div>
            </motion.div>

            {/* Groups Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {filteredGroups.length === 0 ? (
                <Card className="bg-slate-900/30 border-slate-700/50 backdrop-blur-sm">
                  <CardContent className="p-12 text-center">
                    {searchTerm ? (
                      <>
                        <Search className="mx-auto h-16 w-16 text-slate-600 mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">
                          No groups found
                        </h3>
                        <p className="text-slate-400 mb-6">
                          No groups match your search &ldquo;{searchTerm}
                          &rdquo;. Try a different search term.
                        </p>
                        <Button
                          onClick={() => setSearchTerm("")}
                          variant="outline"
                          className="border-white/10 text-slate-300 hover:bg-white/10"
                        >
                          Clear Search
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="relative mb-6">
                          <div className="absolute inset-0 bg-white/5 rounded-full blur-xl" />
                          <Users className="relative mx-auto h-16 w-16 text-slate-600" />
                        </div>
                        <h3 className="text-2xl font-semibold text-white mb-2">
                          No groups yet
                        </h3>
                        <p className="text-slate-400 mb-8 max-w-md mx-auto">
                          Create your first travel group or join an existing one
                          to start sharing amazing memories with your friends
                          and family.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <Button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-slate-800/50 border border-white/10 hover:bg-slate-700/50 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-white/10"
                          >
                            <Plus className="mr-2 h-5 w-5" />
                            Create Your First Group
                          </Button>
                          <Button
                            onClick={() => setShowJoinModal(true)}
                            variant="outline"
                            className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white px-8 py-3 rounded-xl font-medium transition-all duration-200"
                          >
                            <Users className="mr-2 h-5 w-5" />
                            Join Existing Group
                          </Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-white">
                        Your Groups
                      </h3>
                      <p className="text-slate-400">
                        {filteredGroups.length} of {groups.length} groups
                        {searchTerm && ` matching "${searchTerm}"`}
                      </p>
                    </div>
                    {searchTerm && (
                      <Button
                        onClick={() => setSearchTerm("")}
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:text-white"
                      >
                        Clear Search
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                      {filteredGroups.map((group, index) => (
                        <motion.div
                          key={group.id}
                          initial={{ opacity: 0, y: 20, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -20, scale: 0.9 }}
                          transition={{
                            delay: index * 0.1,
                            duration: 0.3,
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                          }}
                          whileHover={{ y: -5 }}
                          className="group"
                        >
                          <GroupCard
                            group={{
                              ...group,
                              role: group.adminIds.includes(user.uid)
                                ? "Admin"
                                : "Member",
                            }}
                            onEnterGroupAction={handleEnterGroup}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </div>

        {/* Modals */}
        <CreateGroupModal
          open={showCreateModal}
          onOpenChangeAction={setShowCreateModal}
          onGroupCreatedAction={handleGroupCreated}
        />

        <JoinGroupModal
          open={showJoinModal}
          onOpenChangeAction={setShowJoinModal}
          onGroupJoinedAction={handleGroupJoined}
        />
      </div>
    </>
  );
}
