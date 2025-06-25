"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Users, Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { getUserGroups } from "@/lib/group-utils";
import { CreateGroupModal } from "@/components/groups/modals/create-group-modal-new";
import { JoinGroupModal } from "@/components/groups/modals/join-group-modal-new";
import { GroupCard } from "@/components/groups/group-card";
import type { Group } from "@/types/group";

export default function DashboardPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const { user, signOut } = useAuth();
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

  const handleGroupCreated = (newGroup: Group) => {
    setGroups((prev) => [newGroup, ...prev]);
  };

  const handleGroupJoined = (joinedGroup: Group) => {
    setGroups((prev) => [joinedGroup, ...prev]);
  };

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error signing out",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSigningOut(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Welcome back, {user.displayName || user.email?.split("@")[0]}!
              </h1>
              <p className="text-slate-400">
                Manage your travel groups and share memories
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white shadow-lg shadow-blue-500/20 rounded-xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Group
              </Button>
              <Button
                onClick={() => setShowJoinModal(true)}
                variant="outline"
                className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl"
              >
                <Users className="w-4 h-4 mr-2" />
                Join Group
              </Button>
              <Button
                onClick={handleSignOut}
                disabled={signingOut}
                variant="outline"
                className="border-red-700 text-red-300 hover:bg-red-800/20 hover:text-red-200 hover:border-red-600 rounded-xl"
              >
                {signingOut ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4 mr-2" />
                )}
                {signingOut ? "Signing out..." : "Sign Out"}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Groups Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto mb-4" />
                <p className="text-slate-400">Loading your groups...</p>
              </div>
            </div>
          ) : groups.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="max-w-md mx-auto">
                <Users className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  No groups yet
                </h3>
                <p className="text-slate-400 mb-6">
                  Create your first travel group or join an existing one to
                  start sharing memories.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white shadow-lg shadow-blue-500/20 rounded-xl"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Group
                  </Button>
                  <Button
                    onClick={() => setShowJoinModal(true)}
                    variant="outline"
                    className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Join a Group
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-semibold text-white mb-6">
                Your Groups ({groups.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.map((group, index) => {
                  // Determine user role in the group
                  const isAdmin = group.adminIds.includes(user.uid);
                  const role = isAdmin ? "Admin" : "Member";

                  return (
                    <motion.div
                      key={group.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <GroupCard
                        group={{ ...group, role }}
                        onEnterGroupAction={(g) =>
                          (window.location.href = `/groups/${g.id}`)
                        }
                      />
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
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
  );
}
