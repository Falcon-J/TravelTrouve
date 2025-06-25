"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Camera, Users, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createGroup } from "@/lib/group-utils";
import { useAuth } from "@/context/auth-context";
import type { CreateGroupInput, Group } from "@/types/group";

type CreateGroupModalProps = {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  onGroupCreatedAction: (group: Group) => void;
};

export function CreateGroupModal({
  open,
  onOpenChangeAction,
  onGroupCreatedAction,
}: CreateGroupModalProps) {
  const [groupName, setGroupName] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);
  const [allowJoinRequests, setAllowJoinRequests] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!groupName.trim()) {
      toast({
        title: "Group name required",
        description: "Please enter a name for your group",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to create a group",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const groupData: CreateGroupInput = {
        name: groupName.trim(),
        isPrivate,
        allowJoinRequests,
      };

      const newGroup = await createGroup(groupData, user.uid);

      toast({
        title: "Group created!",
        description: `${newGroup.name} has been created. Group code: ${newGroup.code}`,
      });

      onGroupCreatedAction(newGroup);
      onOpenChangeAction(false);

      // Reset form
      setGroupName("");
      setIsPrivate(true);
      setAllowJoinRequests(false);
    } catch (error) {
      toast({
        title: "Error creating group",
        description:
          error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={isLoading ? undefined : onOpenChangeAction}
    >
      <DialogContent className="sm:max-w-md rounded-2xl bg-slate-900 border-slate-800">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl text-white">
            <Camera className="mr-2 h-5 w-5 text-blue-400" />
            Create New Group
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label
              htmlFor="group-name"
              className="text-sm font-semibold text-slate-300"
            >
              Group Name
            </Label>
            <Input
              id="group-name"
              placeholder="e.g., Iceland Adventure 2024"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="mt-2 rounded-xl border-slate-700 bg-slate-800 text-white focus:border-blue-500"
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Users className="h-4 w-4 text-slate-400" />
                <div>
                  <h4 className="text-sm font-medium leading-none text-slate-300">
                    Private Group
                  </h4>
                  <p className="text-xs text-slate-400">
                    Only invited members can join
                  </p>
                </div>
              </div>
              <Switch
                checked={isPrivate}
                onCheckedChange={setIsPrivate}
                disabled={isLoading}
              />
            </div>

            {!isPrivate && (
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium leading-none text-slate-300">
                    Allow Join Requests
                  </h4>
                  <p className="text-xs text-slate-400">
                    Let people request to join
                  </p>
                </div>
                <Switch
                  checked={allowJoinRequests}
                  onCheckedChange={setAllowJoinRequests}
                  disabled={isLoading}
                />
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChangeAction(false)}
              disabled={isLoading}
              className="rounded-xl border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !groupName.trim()}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Group"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
