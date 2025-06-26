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
import { Users, Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getGroupByCode, joinGroup } from "@/lib/group-utils";
import { useAuth } from "@/context/auth-context";
import type { Group } from "@/types/group";

type JoinGroupModalProps = {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  onGroupJoinedAction: (group: Group) => void;
};

export function JoinGroupModal({
  open,
  onOpenChangeAction,
  onGroupJoinedAction,
}: JoinGroupModalProps) {
  const [groupCode, setGroupCode] = useState("");
  const [foundGroup, setFoundGroup] = useState<Group | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSearch = async () => {
    if (!groupCode.trim()) {
      toast({
        title: "Group code required",
        description: "Please enter a group code",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    setFoundGroup(null);

    try {
      const group = await getGroupByCode(groupCode.trim().toUpperCase());

      if (!group) {
        toast({
          title: "Group not found",
          description: "No group found with that code",
          variant: "destructive",
        });
        return;
      }

      if (group.memberIds.includes(user?.uid || "")) {
        toast({
          title: "Already a member",
          description: "You are already a member of this group",
          variant: "destructive",
        });
        return;
      }

      // Check if group is private and join requests are not allowed
      if (group.isPrivate && !group.allowJoinRequests) {
        toast({
          title: "Private Group",
          description:
            "This group is private and doesn't allow join requests. You need an invitation.",
          variant: "destructive",
        });
        return;
      }

      setFoundGroup(group);
    } catch (error) {
      toast({
        title: "Error searching for group",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleJoin = async () => {
    if (!foundGroup || !user) return;

    setIsJoining(true);

    try {
      // Check if this is a private group that requires join requests
      if (foundGroup.isPrivate && foundGroup.allowJoinRequests) {
        // TODO: Implement join request functionality
        toast({
          title: "Join request sent",
          description:
            "Your request to join this private group has been sent to the admins",
        });

        onOpenChangeAction(false);
        setGroupCode("");
        setFoundGroup(null);
        return;
      }

      // Direct join for public groups or invited private groups
      await joinGroup(foundGroup.id, user.uid);

      toast({
        title: "Joined group!",
        description: `You are now a member of ${foundGroup.name}`,
      });

      onGroupJoinedAction({
        ...foundGroup,
        memberIds: [...foundGroup.memberIds, user.uid],
        memberCount: foundGroup.memberCount + 1,
      });
      onOpenChangeAction(false);

      // Reset form
      setGroupCode("");
      setFoundGroup(null);
    } catch (error) {
      toast({
        title: "Error joining group",
        description:
          error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !foundGroup) {
      handleSearch();
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={isSearching || isJoining ? undefined : onOpenChangeAction}
    >
      <DialogContent className="sm:max-w-md rounded-2xl bg-slate-900 border-slate-800">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl text-white">
            <Users className="mr-2 h-5 w-5 text-emerald-400" />
            Join Group
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label
              htmlFor="group-code"
              className="text-sm font-semibold text-slate-300"
            >
              Group Code
            </Label>
            <div className="flex space-x-2 mt-2">
              <Input
                id="group-code"
                placeholder="Enter 6-character code"
                value={groupCode}
                onChange={(e) => {
                  setGroupCode(e.target.value.toUpperCase());
                  setFoundGroup(null);
                }}
                onKeyPress={handleKeyPress}
                className="rounded-xl border-slate-700 bg-slate-800 text-white focus:border-emerald-500 uppercase"
                disabled={isSearching || isJoining}
                maxLength={6}
              />
              <Button
                type="button"
                onClick={handleSearch}
                disabled={
                  isSearching || !groupCode.trim() || foundGroup !== null
                }
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
              >
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Search"
                )}
              </Button>
            </div>
          </div>

          {foundGroup && (
            <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
              <div className="flex items-center space-x-3 mb-3">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
                <span className="text-sm font-medium text-emerald-400">
                  Group Found!
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-white">{foundGroup.name}</h3>
                <p className="text-sm text-slate-400">
                  {foundGroup.memberCount} member
                  {foundGroup.memberCount !== 1 ? "s" : ""}
                </p>
                <p className="text-sm text-slate-400">
                  {foundGroup.isPrivate ? "Private" : "Public"} group
                  {foundGroup.isPrivate &&
                    foundGroup.allowJoinRequests &&
                    " • Join requests allowed"}
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChangeAction(false);
                setGroupCode("");
                setFoundGroup(null);
              }}
              disabled={isSearching || isJoining}
              className="rounded-xl border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Button>

            {foundGroup && (
              <Button
                type="button"
                onClick={handleJoin}
                disabled={isJoining}
                className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
              >
                {isJoining ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {foundGroup.isPrivate && foundGroup.allowJoinRequests
                      ? "Requesting..."
                      : "Joining..."}
                  </>
                ) : foundGroup.isPrivate && foundGroup.allowJoinRequests ? (
                  "Request to Join"
                ) : (
                  "Join Group"
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
