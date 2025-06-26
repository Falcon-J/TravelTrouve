"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Loader2,
  UserPlus,
  Copy,
  Search,
  Users,
  Crown,
  Shield,
  MoreVertical,
  UserMinus,
  UserCheck,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import {
  updateDoc,
  doc,
  arrayRemove,
  arrayUnion,
  increment,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getUsersByIds } from "@/lib/firebase-utils";
import type { Group } from "@/types/group";
import type { AppUser } from "@/types/user";

interface GroupMembersProps {
  group: Group;
  onGroupUpdated?: (updatedGroup: Group) => void;
}

export function GroupMembers({ group, onGroupUpdated }: GroupMembersProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [members, setMembers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [memberActionLoading, setMemberActionLoading] = useState<string | null>(
    null
  );
  const { user } = useAuth();
  const { toast } = useToast();

  const isAdmin = user && group.adminIds.includes(user.uid);
  const isCreator = user && group.creatorId === user.uid;

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

  const handleRemoveMember = async (memberId: string) => {
    if (!isAdmin || !user) {
      toast({
        title: "Permission Denied",
        description: "Only admins can remove members",
        variant: "destructive",
      });
      return;
    }

    // Cannot remove yourself
    if (memberId === user.uid) {
      toast({
        title: "Cannot Remove Yourself",
        description: "Use the leave group option in settings instead",
        variant: "destructive",
      });
      return;
    }

    // Cannot remove the creator
    if (memberId === group.creatorId) {
      toast({
        title: "Cannot Remove Creator",
        description: "The group creator cannot be removed",
        variant: "destructive",
      });
      return;
    }

    setMemberActionLoading(memberId);
    try {
      const groupRef = doc(db, "groups", group.id);
      await updateDoc(groupRef, {
        memberIds: arrayRemove(memberId),
        adminIds: arrayRemove(memberId), // Remove from admin too if they were admin
        memberCount: increment(-1),
        updatedAt: serverTimestamp(),
      });

      setMembers((prev) => prev.filter((member) => member.id !== memberId));

      // Update the group object
      const updatedGroup = {
        ...group,
        memberIds: group.memberIds.filter((id) => id !== memberId),
        adminIds: group.adminIds.filter((id) => id !== memberId),
        memberCount: group.memberCount - 1,
      };
      onGroupUpdated?.(updatedGroup);

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
    } finally {
      setMemberActionLoading(null);
    }
  };

  const handleToggleAdmin = async (
    memberId: string,
    isCurrentlyAdmin: boolean
  ) => {
    if (!isAdmin || !user) {
      toast({
        title: "Permission Denied",
        description: "Only admins can change member roles",
        variant: "destructive",
      });
      return;
    }

    // Cannot change your own role unless you're the creator
    if (memberId === user.uid && !isCreator) {
      toast({
        title: "Cannot Change Own Role",
        description: "You cannot change your own admin status",
        variant: "destructive",
      });
      return;
    }

    setMemberActionLoading(memberId);
    try {
      const groupRef = doc(db, "groups", group.id);

      if (isCurrentlyAdmin) {
        // Remove admin role
        await updateDoc(groupRef, {
          adminIds: arrayRemove(memberId),
          updatedAt: serverTimestamp(),
        });
      } else {
        // Add admin role
        await updateDoc(groupRef, {
          adminIds: arrayUnion(memberId),
          updatedAt: serverTimestamp(),
        });
      }

      // Update the group object
      const updatedAdminIds = isCurrentlyAdmin
        ? group.adminIds.filter((id) => id !== memberId)
        : [...group.adminIds, memberId];

      const updatedGroup = {
        ...group,
        adminIds: updatedAdminIds,
      };
      onGroupUpdated?.(updatedGroup);

      toast({
        title: isCurrentlyAdmin ? "Admin role removed" : "Admin role granted",
        description: `Member ${
          isCurrentlyAdmin ? "is no longer" : "is now"
        } an admin`,
      });
    } catch (error) {
      console.error("Error toggling admin role:", error);
      toast({
        title: "Error",
        description: "Could not update member role. Please try again.",
        variant: "destructive",
      });
    } finally {
      setMemberActionLoading(null);
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

  const filteredMembers = members.filter(
    (member) =>
      member.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMemberRole = (memberId: string) => {
    if (memberId === group.creatorId) return "Creator";
    if (group.adminIds.includes(memberId)) return "Admin";
    return "Member";
  };

  const getMemberBadgeVariant = (role: string) => {
    switch (role) {
      case "Creator":
        return "default";
      case "Admin":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold text-white mb-2">Group Members</h2>
        <p className="text-gray-400">Manage your travel companions</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5" />
                Members ({group.memberCount})
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyInviteLink}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Invite Link
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-800/50 border-slate-600 text-white"
                />
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredMembers.map((member) => {
                    const role = getMemberRole(member.id);
                    const isCurrentlyAdmin = group.adminIds.includes(member.id);
                    const canManageMember =
                      isAdmin && member.id !== group.creatorId;

                    return (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={member.photoURL || undefined}
                              alt={member.displayName || undefined}
                            />
                            <AvatarFallback className="bg-slate-700 text-slate-300">
                              {member.displayName?.[0]?.toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-white font-medium">
                                {member.displayName || "Unknown User"}
                              </p>
                              <Badge
                                variant={getMemberBadgeVariant(role)}
                                className="text-xs"
                              >
                                {role === "Creator" && (
                                  <Crown className="h-3 w-3 mr-1" />
                                )}
                                {role === "Admin" && (
                                  <Shield className="h-3 w-3 mr-1" />
                                )}
                                {role}
                              </Badge>
                            </div>
                            <p className="text-slate-400 text-sm">
                              {member.email}
                            </p>
                          </div>
                        </div>

                        {canManageMember && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-700"
                                disabled={memberActionLoading === member.id}
                              >
                                {memberActionLoading === member.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <MoreVertical className="h-4 w-4" />
                                )}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="bg-slate-800 border-slate-700"
                            >
                              <DropdownMenuItem
                                onClick={() =>
                                  handleToggleAdmin(member.id, isCurrentlyAdmin)
                                }
                                className="text-slate-300 hover:bg-slate-700 hover:text-white"
                              >
                                {isCurrentlyAdmin ? (
                                  <>
                                    <UserMinus className="h-4 w-4 mr-2" />
                                    Remove Admin
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="h-4 w-4 mr-2" />
                                    Make Admin
                                  </>
                                )}
                              </DropdownMenuItem>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem
                                    onSelect={(e) => e.preventDefault()}
                                    className="text-red-400 hover:bg-red-600 hover:text-white"
                                  >
                                    <UserMinus className="h-4 w-4 mr-2" />
                                    Remove Member
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-slate-900 border-slate-700">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-white">
                                      Remove Member
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="text-slate-400">
                                      Are you sure you want to remove{" "}
                                      {member.displayName} from the group? They
                                      will lose access to all photos and
                                      content.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700">
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleRemoveMember(member.id)
                                      }
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Remove Member
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    );
                  })}

                  {filteredMembers.length === 0 && !loading && (
                    <div className="text-center py-8">
                      <p className="text-slate-400">No members found</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Group Statistics */}
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">Group Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Members</span>
                <span className="text-white font-medium">
                  {group.memberCount}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Administrators</span>
                <span className="text-white font-medium">
                  {group.adminIds.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Photos</span>
                <span className="text-white font-medium">
                  {group.photoCount}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Group Type</span>
                <span className="text-white font-medium">
                  {group.isPrivate ? "Private" : "Public"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Invite New Members */}
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Invite Members
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-400 text-sm">
                Share your group code with friends to invite them to join.
              </p>
              <div className="p-4 bg-slate-800/50 rounded-lg text-center">
                <p className="text-slate-300 text-sm mb-2">Group Code</p>
                <p className="text-white font-mono text-lg">{group.code}</p>
              </div>
              <Button
                onClick={handleCopyInviteLink}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Invite Link
              </Button>
            </CardContent>
          </Card>

          {/* Privacy Settings Info */}
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">Privacy Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                {group.isPrivate ? (
                  <div className="h-2 w-2 bg-red-400 rounded-full" />
                ) : (
                  <div className="h-2 w-2 bg-green-400 rounded-full" />
                )}
                <span className="text-slate-300 text-sm">
                  {group.isPrivate ? "Private Group" : "Public Group"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {group.allowJoinRequests ? (
                  <div className="h-2 w-2 bg-green-400 rounded-full" />
                ) : (
                  <div className="h-2 w-2 bg-red-400 rounded-full" />
                )}
                <span className="text-slate-300 text-sm">
                  Join Requests{" "}
                  {group.allowJoinRequests ? "Allowed" : "Not Allowed"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
