"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
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
  Settings,
  Users,
  Lock,
  Globe,
  UserPlus,
  Trash2,
  Copy,
  Check,
  Shield,
  RefreshCw,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import {
  updateDoc,
  doc,
  serverTimestamp,
  deleteDoc,
  arrayRemove,
  increment,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { generateGroupCode } from "@/lib/group-utils";
import type { Group } from "@/types/group";

interface GroupSettingsProps {
  group: Group;
  onGroupUpdated?: (updatedGroup: Group) => void;
  onGroupDeleted?: () => void;
  onLeaveGroup?: () => void;
}

export function GroupSettings({
  group,
  onGroupUpdated,
  onGroupDeleted,
  onLeaveGroup,
}: GroupSettingsProps) {
  const [groupName, setGroupName] = useState(group.name);
  const [isPrivate, setIsPrivate] = useState(group.isPrivate);
  const [allowJoinRequests, setAllowJoinRequests] = useState(
    group.allowJoinRequests || false
  );
  const [loading, setLoading] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [regeneratingCode, setRegeneratingCode] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const isAdmin = user && group.adminIds.includes(user.uid);
  const isCreator = user && group.creatorId === user.uid;

  const handleSaveSettings = async () => {
    if (!isAdmin || !user) {
      toast({
        title: "Permission Denied",
        description: "Only admins can update group settings",
        variant: "destructive",
      });
      return;
    }

    if (!groupName.trim()) {
      toast({
        title: "Invalid Name",
        description: "Group name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const groupRef = doc(db, "groups", group.id);
      await updateDoc(groupRef, {
        name: groupName.trim(),
        isPrivate,
        allowJoinRequests,
        updatedAt: serverTimestamp(),
      });

      const updatedGroup = {
        ...group,
        name: groupName.trim(),
        isPrivate,
        allowJoinRequests,
      };

      onGroupUpdated?.(updatedGroup);
      toast({
        title: "Settings Updated",
        description: "Group settings have been saved successfully",
      });
    } catch (error) {
      console.error("Error updating group settings:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update group settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateCode = async () => {
    if (!isAdmin || !user) {
      toast({
        title: "Permission Denied",
        description: "Only admins can regenerate the group code",
        variant: "destructive",
      });
      return;
    }

    setRegeneratingCode(true);
    try {
      const newCode = await generateGroupCode();
      const groupRef = doc(db, "groups", group.id);
      await updateDoc(groupRef, {
        code: newCode,
        updatedAt: serverTimestamp(),
      });

      const updatedGroup = { ...group, code: newCode };
      onGroupUpdated?.(updatedGroup);

      toast({
        title: "Code Regenerated",
        description: "A new group code has been generated",
      });
    } catch (error) {
      console.error("Error regenerating code:", error);
      toast({
        title: "Regeneration Failed",
        description: "Failed to regenerate group code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRegeneratingCode(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!isCreator || !user) {
      toast({
        title: "Permission Denied",
        description: "Only the group creator can delete the group",
        variant: "destructive",
      });
      return;
    }

    try {
      const groupRef = doc(db, "groups", group.id);
      await deleteDoc(groupRef);

      onGroupDeleted?.();
      router.push("/dashboard");
      toast({
        title: "Group Deleted",
        description: "The group has been permanently deleted",
      });
    } catch (error) {
      console.error("Error deleting group:", error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete group. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLeaveGroup = async () => {
    if (!user) return;

    // Check if user is the only admin
    if (isAdmin && group.adminIds.length === 1 && group.memberCount > 1) {
      toast({
        title: "Cannot Leave",
        description:
          "You cannot leave as the only admin. Transfer admin role first or delete the group.",
        variant: "destructive",
      });
      return;
    }

    try {
      const groupRef = doc(db, "groups", group.id);
      await updateDoc(groupRef, {
        memberIds: arrayRemove(user.uid),
        adminIds: arrayRemove(user.uid),
        memberCount: increment(-1),
        updatedAt: serverTimestamp(),
      });

      onLeaveGroup?.();
      router.push("/dashboard");
      toast({
        title: "Left Group",
        description: "You have left the group successfully",
      });
    } catch (error) {
      console.error("Error leaving group:", error);
      toast({
        title: "Leave Failed",
        description: "Failed to leave group. Please try again.",
        variant: "destructive",
      });
    }
  };

  const copyGroupCode = async () => {
    try {
      await navigator.clipboard.writeText(group.code);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
      toast({
        title: "Code Copied",
        description: "Group code copied to clipboard",
      });
    } catch (error) {
      console.error("Error copying code:", error);
      toast({
        title: "Copy Failed",
        description: "Failed to copy group code",
        variant: "destructive",
      });
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-white mb-2">Group Settings</h2>
          <p className="text-gray-400">
            View group information and manage your membership
          </p>
        </motion.div>

        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Group Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-slate-300">Group Name</Label>
                <Input
                  value={group.name}
                  disabled
                  className="bg-slate-800/50 border-slate-600 text-slate-400 mt-1"
                />
              </div>
              <div>
                <Label className="text-slate-300">Group Code</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={group.code}
                    disabled
                    className="bg-slate-800/50 border-slate-600 text-slate-400 font-mono"
                  />
                  <Button
                    onClick={copyGroupCode}
                    variant="outline"
                    size="icon"
                    className="border-slate-600 text-slate-400 hover:text-white hover:bg-slate-700"
                  >
                    {codeCopied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
                <div className="flex items-center gap-3">
                  {group.isPrivate ? (
                    <Lock className="h-5 w-5 text-slate-400" />
                  ) : (
                    <Globe className="h-5 w-5 text-slate-400" />
                  )}
                  <div>
                    <p className="text-white font-medium">Privacy</p>
                    <p className="text-slate-400 text-sm">
                      {group.isPrivate ? "Private" : "Public"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <UserPlus className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-white font-medium">Join Requests</p>
                    <p className="text-slate-400 text-sm">
                      {group.allowJoinRequests ? "Allowed" : "Not Allowed"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="bg-slate-700" />

            <div>
              <h3 className="text-white font-medium mb-4">Leave Group</h3>
              <p className="text-slate-400 text-sm mb-4">
                You will no longer have access to this group and its content.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Leave Group
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-slate-900 border-slate-700">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">
                      Leave Group
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-400">
                      Are you sure you want to leave this group? You will lose
                      access to all photos and content.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleLeaveGroup}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Leave Group
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-white mb-2">Group Settings</h2>
        <p className="text-gray-400">
          Manage your group preferences and permissions
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Settings */}
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Basic Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="groupName" className="text-slate-300">
                Group Name
              </Label>
              <Input
                id="groupName"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="bg-slate-800/50 border-slate-600 text-white mt-1"
                placeholder="Enter group name"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {isPrivate ? (
                      <Lock className="h-4 w-4 text-slate-400" />
                    ) : (
                      <Globe className="h-4 w-4 text-slate-400" />
                    )}
                    <Label className="text-slate-300">Private Group</Label>
                  </div>
                  <p className="text-sm text-slate-400">
                    Private groups require an invitation to join
                  </p>
                </div>
                <Switch checked={isPrivate} onCheckedChange={setIsPrivate} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4 text-slate-400" />
                    <Label className="text-slate-300">
                      Allow Join Requests
                    </Label>
                  </div>
                  <p className="text-sm text-slate-400">
                    Allow users to request to join the group
                  </p>
                </div>
                <Switch
                  checked={allowJoinRequests}
                  onCheckedChange={setAllowJoinRequests}
                />
              </div>
            </div>

            <Button
              onClick={handleSaveSettings}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Saving..." : "Save Settings"}
            </Button>
          </CardContent>
        </Card>

        {/* Group Access */}
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5" />
              Group Access
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-slate-300">Group Code</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={group.code}
                  disabled
                  className="bg-slate-800/50 border-slate-600 text-slate-400 font-mono"
                />
                <Button
                  onClick={copyGroupCode}
                  variant="outline"
                  size="icon"
                  className="border-slate-600 text-slate-400 hover:text-white hover:bg-slate-700"
                >
                  {codeCopied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-sm text-slate-400 mt-1">
                Share this code with others to invite them to the group
              </p>
            </div>

            <Button
              onClick={handleRegenerateCode}
              disabled={regeneratingCode}
              variant="outline"
              className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${
                  regeneratingCode ? "animate-spin" : ""
                }`}
              />
              {regeneratingCode ? "Regenerating..." : "Regenerate Code"}
            </Button>

            <div className="text-sm text-slate-400">
              <p className="mb-2">
                <strong>Members:</strong> {group.memberCount}
              </p>
              <p>
                <strong>Photos:</strong> {group.photoCount}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Danger Zone */}
      <Card className="bg-slate-900/50 border-red-800/50">
        <CardHeader>
          <CardTitle className="text-red-400 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <h3 className="text-white font-medium mb-1">Leave Group</h3>
              <p className="text-slate-400 text-sm">
                You will lose access to this group and its content.
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Leave Group
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-slate-900 border-slate-700">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">
                    Leave Group
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-slate-400">
                    Are you sure you want to leave this group? You will lose
                    access to all photos and content.
                    {isAdmin &&
                      group.adminIds.length === 1 &&
                      group.memberCount > 1 && (
                        <span className="block mt-2 text-red-400">
                          Warning: You are the only admin. Consider transferring
                          admin role first.
                        </span>
                      )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleLeaveGroup}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Leave Group
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {isCreator && (
            <>
              <Separator className="bg-slate-700" />
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <h3 className="text-white font-medium mb-1">Delete Group</h3>
                  <p className="text-slate-400 text-sm">
                    Permanently delete this group and all its content. This
                    action cannot be undone.
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Group
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-slate-900 border-slate-700">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-white">
                        Delete Group
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-slate-400">
                        This action cannot be undone. This will permanently
                        delete the group, remove all members, and delete all
                        photos and content.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteGroup}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete Group
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
