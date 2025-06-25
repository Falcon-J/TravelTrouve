"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Users } from "lucide-react";
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
    setGroups((prev) => {
      // Check if group already exists
      const exists = prev.some((g) => g.id === joinedGroup.id);
      if (exists) return prev;
      return [joinedGroup, ...prev];
    });
  };

  const handleEnterGroup = (group: Group) => {
    // Navigate to group page
    window.location.href = `/groups/${group.id}`;
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-white mb-4">
            Please log in to view your groups
          </h1>
          <Button onClick={() => (window.location.href = "/login")}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Your Groups</h1>
        <p className="text-slate-400">Manage and explore your travel groups</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-4 mb-8"
      >
        <Button
          onClick={() => setShowCreateModal(true)}
          className="rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Group
        </Button>

        <Button
          onClick={() => setShowJoinModal(true)}
          variant="outline"
          className="rounded-lg border-slate-700 text-slate-300 hover:bg-slate-800"
        >
          <Users className="mr-2 h-4 w-4" />
          Join Group
        </Button>
      </motion.div>

      {groups.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center py-16"
        >
          <div className="max-w-md mx-auto">
            <Users className="mx-auto h-16 w-16 text-slate-600 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No groups yet
            </h3>
            <p className="text-slate-400 mb-6">
              Create your first group or join an existing one to get started
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => setShowCreateModal(true)}
                className="rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Group
              </Button>
              <Button
                onClick={() => setShowJoinModal(true)}
                variant="outline"
                className="rounded-lg border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                <Users className="mr-2 h-4 w-4" />
                Join Group
              </Button>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {groups.map((group, index) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GroupCard
                group={{
                  ...group,
                  role: group.adminIds.includes(user.uid) ? "Admin" : "Member",
                }}
                onEnterGroup={handleEnterGroup}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      <CreateGroupModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onGroupCreated={handleGroupCreated}
      />

      <JoinGroupModal
        open={showJoinModal}
        onOpenChange={setShowJoinModal}
        onGroupJoined={handleGroupJoined}
      />
    </div>
  );
}
