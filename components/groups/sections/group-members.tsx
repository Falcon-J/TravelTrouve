"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { InviteMemberModal } from "@/components/invite-member-modal";
import { Loader2, UserPlus, Copy, Search, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getUsersByIds, removeGroupMember } from "@/lib/firebase-utils";
import type { Group } from "@/types/group";
import type { AppUser } from "@/types/user";

interface GroupMembersProps {
  group: Group;
  currentUser: AppUser;
}

export function GroupMembers({ group, currentUser }: GroupMembersProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [members, setMembers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const isAdmin = group.role === "Admin";

  useEffect(() => {
    const loadMembers = async () => {
      try {
        const membersList = (await getUsersByIds(group.memberIds)) as AppUser[];
        setMembers(membersList);
      } catch (error) {
        console.error("Error loading members:", error);
        toast({
          title: "Error loading members",
          description: "Please try again later",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadMembers();
  }, [group.memberIds, toast]);

  const handleRemoveMember = async (userId: string) => {
    try {
      await removeGroupMember(group.id, userId);
      setMembers((prev) => prev.filter((member) => member.id !== userId));
      toast({
        title: "Member removed",
        description: "The member has been removed from the group",
      });
    } catch (error) {
      console.error("Error removing member:", error);
      toast({
        title: "Error",
        description: "Could not remove member. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCopyInviteLink = () => {
    const inviteLink = `${window.location.origin}/join/${group.code}`;
    navigator.clipboard.writeText(inviteLink);
    toast({
      title: "Invite link copied!",
      description: "Share this link with friends to invite them to the group",
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">Group Members</h1>
        <p className="text-gray-400">Manage your travel companions</p>
      </motion.div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="rounded-2xl shadow-lg bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">Members (1)</CardTitle>
              {isAdmin && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyInviteLink}
                    className="rounded-xl border-gray-700 text-white hover:bg-gray-800"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Link
                  </Button>
                  <Button
                    onClick={() => setShowInviteModal(true)}
                    className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    size="sm"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 rounded-2xl border-gray-700 bg-gray-800 text-white focus:border-blue-500"
                  />
                </div>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto" />
                </div>
              ) : members.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Just you for now
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Invite friends to join your travel group
                  </p>
                  {isAdmin && (
                    <Button
                      onClick={() => setShowInviteModal(true)}
                      className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite Members
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {members
                    .filter(
                      (member) =>
                        member.name
                          ?.toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        member.email
                          ?.toLowerCase()
                          .includes(searchTerm.toLowerCase())
                    )
                    .map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-gray-800/50 border border-gray-700"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={member.avatar || "/placeholder-user.jpg"}
                              alt={member.name}
                            />
                            <AvatarFallback>{member.name?.[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-white">
                              {member.name}
                            </p>
                            <p className="text-sm text-gray-400">
                              {member.email}
                            </p>
                          </div>
                        </div>
                        {isAdmin && member.id !== currentUser.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMember(member.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          <Card className="rounded-2xl shadow-lg bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Group Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Total Photos</span>
                <span className="font-semibold text-white">0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Active Members</span>
                <span className="font-semibold text-white">
                  {group.memberCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Group Created</span>
                <span className="font-semibold text-white">
                  {"toDate" in group.createdAt
                    ? group.createdAt.toDate().toLocaleDateString()
                    : ""}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Most Active</span>
                <span className="font-semibold text-white">-</span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-lg bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Group Code</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center p-4 bg-gray-800 rounded-2xl">
                <p className="text-sm text-gray-400 mb-2">Share this code</p>
                <p className="text-2xl font-mono font-bold text-white mb-4">
                  {group.code}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyInviteLink}
                  className="rounded-xl border-gray-700 text-white hover:bg-gray-700"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Invite Link
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>{" "}
      <InviteMemberModal
        open={showInviteModal}
        onOpenChangeAction={setShowInviteModal}
        groupCode={group.code}
      />
    </div>
  );
}
