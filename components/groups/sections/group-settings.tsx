"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  Settings,
  Shield,
  Trash2,
  RefreshCw,
  Users,
  Eye,
  EyeOff,
  Crown,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import {
  updateGroup,
  generateUniqueGroupCode,
  deleteGroup,
} from "@/lib/firebase-utils";

import type { Group } from "@/types/group";
import type { User } from "@/types/user";


interface GroupSettingsProps {
  group: Group;
  currentUser: User;
}

export function GroupSettings({ group, currentUser }: GroupSettingsProps) {
  const [groupName, setGroupName] = useState(group.name);
  const [isPrivate, setIsPrivate] = useState(true);
  const [allowJoinRequests, setAllowJoinRequests] = useState(false);
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const router = useRouter();

  const handleSaveSettings = async () => {
    if (!groupName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a group name",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await updateGroup(group.id, {
        name: groupName.trim(),
        isPrivate,
        allowJoinRequests,
      });

      toast({
        title: "Settings saved",
        description: "Group settings have been updated successfully",
      });
    } catch (error) {
      console.error("Error updating settings:", error);
      toast({
        title: "Update failed",
        description: "Failed to update group settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetCode = async () => {
    setIsLoading(true);
    try {
      const newCode = await generateUniqueGroupCode();
      await updateGroup(group.id, { code: newCode });

      toast({
        title: "Code reset",
        description: `New group code: ${newCode}`,
      });
    } catch (error) {
      console.error("Error resetting code:", error);
      toast({
        title: "Reset failed",
        description: "Failed to reset group code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGroup = async () => {
    setIsLoading(true);
    try {
      await deleteGroup(group.id);
      toast({
        title: "Group deleted",
        description: "The group has been permanently deleted",
      });
      router.push("/dashboard");
    } catch (error) {
      console.error("Error deleting group:", error);
      toast({
        title: "Delete failed",
        description: "Failed to delete the group",
        variant: "destructive",
      });
      setIsLoading(false);
      setShowDeleteDialog(false);
    }
  };

  if (group.role !== "Admin") {
    return (
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Admin Access Required
          </h3>
          <p className="text-gray-500">
            Only group administrators can access these settings
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center space-x-3 mb-2">
          <h1 className="text-3xl font-bold text-gray-900">Group Settings</h1>
          <Badge variant="default" className="rounded-full">
            <Crown className="h-3 w-3 mr-1" />
            Admin
          </Badge>
        </div>
        <p className="text-gray-600">
          Manage your group preferences and security
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* General Settings */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label
                  htmlFor="group-name"
                  className="text-sm font-semibold text-gray-700"
                >
                  Group Name
                </Label>
                <Input
                  id="group-name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="mt-2 rounded-xl border-gray-200 focus:border-blue-500"
                />
              </div>

              <div>
                <Label className="text-sm font-semibold text-gray-700">
                  Group Code
                </Label>
                <div className="flex items-center space-x-3 mt-2">
                  <div className="flex-1 p-3 bg-gray-50 rounded-xl">
                    <p className="font-mono font-semibold text-gray-900">
                      {group.code}
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-2xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Reset Group Code</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will generate a new group code. The old code will
                          no longer work for joining the group.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleResetCode}
                          className="rounded-xl"
                        >
                          Reset Code
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              <Button
                onClick={handleSaveSettings}
                className="w-full rounded-xl"
              >
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Privacy & Security */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {isPrivate ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                  <div>
                    <Label className="font-medium">Private Group</Label>
                    <p className="text-sm text-gray-500">
                      Only invited members can view content
                    </p>
                  </div>
                </div>
                <Switch checked={isPrivate} onCheckedChange={setIsPrivate} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Users className="h-4 w-4 text-gray-500" />
                  <div>
                    <Label className="font-medium">Join Requests</Label>
                    <p className="text-sm text-gray-500">
                      Allow people to request to join
                    </p>
                  </div>
                </div>
                <Switch
                  checked={allowJoinRequests}
                  onCheckedChange={setAllowJoinRequests}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card className="rounded-2xl shadow-lg border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center text-red-600">
                <Trash2 className="mr-2 h-5 w-5" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-red-50 rounded-2xl">
                <h4 className="font-semibold text-red-900 mb-2">
                  Delete Group
                </h4>
                <p className="text-sm text-red-700 mb-4">
                  Permanently delete this group and all its photos. This action
                  cannot be undone.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="rounded-xl">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Group
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-2xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete the group "{group.name}" and remove all photos
                        and data associated with it.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-xl">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteGroup}
                        className="rounded-xl bg-red-600 hover:bg-red-700"
                      >
                        Delete Group
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
