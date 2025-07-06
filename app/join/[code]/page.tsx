"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { getGroupByCode, joinGroup } from "@/lib/group-utils";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function JoinGroupPage() {
  const [status, setStatus] = useState("Joining group...");
  const [error, setError] = useState<string | null>(null);
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const groupCode = params.code as string;

  useEffect(() => {
    if (loading) {
      return; // Wait for user auth state to be determined
    }

    if (!user) {
      // If user is not logged in, redirect to login and pass the join code
      toast({
        title: "Please sign in",
        description: "You need to be signed in to join a group.",
      });
      router.push(`/login?redirect=/join/${groupCode}`);
      return;
    }

    if (user && groupCode) {
      const handleJoin = async () => {
        try {
          // First, get the group details to check if it requires join requests
          const group = await getGroupByCode(groupCode);

          if (!group) {
            throw new Error(
              "Group not found. The code may be invalid or expired."
            );
          }

          // Check if user is already a member
          if (group.memberIds.includes(user.uid)) {
            setStatus("You are already a member of this group!");
            toast({
              title: "Already a member",
              description: "You are already part of this group.",
            });
            router.push(`/groups/${group.id}`);
            return;
          }

          // Check if this is a private group (requires invitation)
          if (group.isPrivate) {
            throw new Error(
              "This is a private group. You need a direct invitation to join."
            );
          }

          // Direct join for public groups
          await joinGroup(group.id, user.uid);
          setStatus("Successfully joined group!");
          toast({
            title: "Welcome to the group!",
            description: `You have successfully joined "${group.name}".`,
          });
          router.push(`/groups/${group.id}`);
        } catch (err: unknown) {
          console.error("Failed to join group:", err);
          const errorMessage =
            err instanceof Error
              ? err.message
              : "Could not join the group. The code may be invalid or expired.";
          setError(errorMessage);
          toast({
            title: "Failed to Join Group",
            description: errorMessage,
            variant: "destructive",
          });
        }
      };

      handleJoin();
    }
  }, [user, loading, groupCode, router, toast]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="text-center">
        {!error ? (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
            <h1 className="text-2xl font-semibold mb-2">{status}</h1>
            <p className="text-gray-400">
              Please wait while we add you to the group.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold text-red-500 mb-2">Error</h1>
            <p className="text-gray-400 mb-4">{error}</p>
            <Button onClick={() => router.push("/dashboard")} variant="outline">
              Back to Dashboard
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
