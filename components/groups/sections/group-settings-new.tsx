"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  Trash2,
  Copy,
  Check,
  Crown,
  Shield,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/components/ui/use-toast";
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
  const [loading, setLoading] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

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

    setLoading(true);
    try {
      // Import the update function when we use it
      const { updateDoc, doc } = await import("firebase/firestore");
      const { db } = await import("@/lib/firebase");

      const groupRef = doc(db, "groups", group.id);
      await updateDoc(groupRef, {
        name: groupName.trim(),
        isPrivate,
        updatedAt: new Date(),
      });

      const updatedGroup = {
        ...group,
        name: groupName.trim(),
        isPrivate,
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
      // Import delete functions when we use them
      const { deleteDoc, doc } = await import("firebase/firestore");
      const { db } = await import("@/lib/firebase");

      const groupRef = doc(db, "groups", group.id);
      await deleteDoc(groupRef);

      onGroupDeleted?.();
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

    try {
      // Import Firebase functions when we use them
      const { updateDoc, doc, arrayRemove, increment } = await import(
        "firebase/firestore"
      );
      const { db } = await import("@/lib/firebase");

      const groupRef = doc(db, "groups", group.id);
      await updateDoc(groupRef, {
        memberIds: arrayRemove(user.uid),
        adminIds: arrayRemove(user.uid), // Remove from admin if they are admin
        memberCount: increment(-1),
        updatedAt: new Date(),
      });

      onLeaveGroup?.();
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
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="rounded-2xl shadow-lg bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Settings className="mr-2 h-5 w-5" />
                Basic Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="group-name" className="text-gray-300">
                  Group Name
                </Label>
                <Input
                  id="group-name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  disabled={!isAdmin}
                  className="mt-1 rounded-xl bg-gray-800 border-gray-600 text-white"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-300">Private Group</Label>
                  <p className="text-sm text-gray-500">
                    {isPrivate
                      ? "Only members can see this group"
                      : "Anyone can find this group"}
                  </p>
                </div>
                <Switch
                  checked={isPrivate}
                  onCheckedChange={setIsPrivate}
                  disabled={!isAdmin}
                />
              </div>

              {isAdmin && (
                <Button
                  onClick={handleSaveSettings}
                  disabled={loading}
                  className="w-full rounded-xl bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? "Saving..." : "Save Settings"}
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Group Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="rounded-2xl shadow-lg bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Users className="mr-2 h-5 w-5" />
                Group Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-300">Group Code</Label>
                  <p className="text-sm text-gray-500">
                    Share this code to invite members
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <code className="px-2 py-1 bg-gray-800 rounded text-blue-400 font-mono">
                    {group.code}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copyGroupCode}
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    {codeCopied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400">Privacy</span>
                <div className="flex items-center space-x-1">
                  {isPrivate ? (
                    <>
                      <Lock className="h-4 w-4 text-orange-400" />
                      <span className="text-orange-400">Private</span>
                    </>
                  ) : (
                    <>
                      <Globe className="h-4 w-4 text-green-400" />
                      <span className="text-green-400">Public</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400">Members</span>
                <span className="text-white">{group.memberCount}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400">Photos</span>
                <span className="text-white">{group.photoCount}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400">Your Role</span>
                <div className="flex items-center space-x-1">
                  {isCreator ? (
                    <>
                      <Crown className="h-4 w-4 text-yellow-400" />
                      <span className="text-yellow-400">Creator</span>
                    </>
                  ) : isAdmin ? (
                    <>
                      <Shield className="h-4 w-4 text-blue-400" />
                      <span className="text-blue-400">Admin</span>
                    </>
                  ) : (
                    <>
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-400">Member</span>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="rounded-2xl shadow-lg bg-red-950/20 border-red-800/50">
          <CardHeader>
            <CardTitle className="flex items-center text-red-400">
              <Trash2 className="mr-2 h-5 w-5" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gray-300">Leave Group</Label>
                <p className="text-sm text-gray-500">
                  You will no longer have access to this group
                </p>
              </div>
              {!isCreator && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-red-600 text-red-400 hover:bg-red-600/20"
                    >
                      Leave Group
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-gray-900 border-gray-700">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-white">
                        Leave Group
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-gray-400">
                        Are you sure you want to leave this group? You will no
                        longer have access to photos and conversations.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-gray-800 border-gray-600 text-gray-300">
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
              )}
            </div>

            {isCreator && (
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-300">Delete Group</Label>
                  <p className="text-sm text-gray-500">
                    Permanently delete this group and all its data
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete Group
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-gray-900 border-gray-700">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-white">
                        Delete Group
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-gray-400">
                        This action cannot be undone. This will permanently
                        delete the group and all photos, comments, and data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-gray-800 border-gray-600 text-gray-300">
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
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
