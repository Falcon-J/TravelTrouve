"use client";

import type React from "react";

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
import { Copy, Mail, Link, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InviteMemberModalProps {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  groupCode: string;
}

export function InviteMemberModal({
  open,
  onOpenChangeAction,
  groupCode,
}: InviteMemberModalProps) {
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const inviteLink = `${
    typeof window !== "undefined" ? window.location.origin : ""
  }/join/${groupCode}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Invite link has been copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast({
      title: "Invite sent!",
      description: `Invitation has been sent to ${email}`,
    });

    setIsLoading(false);
    setEmail("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChangeAction}>
      <DialogContent className="sm:max-w-md rounded-2xl glass border-white/10">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl text-white">
            <Mail className="mr-2 h-5 w-5 text-blue-400" />
            Invite Members
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Share Link */}
          <div>
            <Label className="text-sm font-semibold text-slate-300 flex items-center mb-3">
              <Link className="mr-1 h-4 w-4" />
              Share Invite Link
            </Label>
            <div className="flex space-x-2">
              <Input
                value={inviteLink}
                readOnly
                className="rounded-xl glass border-white/10 font-mono text-sm text-white"
              />
              <Button
                onClick={handleCopyLink}
                variant="outline"
                size="sm"
                className="rounded-xl border-white/10 hover:bg-white/10"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Email Invite */}
          <div>
            <Label className="text-sm font-semibold text-slate-300 flex items-center mb-3">
              <Mail className="mr-1 h-4 w-4" />
              Send Email Invite
            </Label>
            <form onSubmit={handleSendInvite} className="space-y-3">
              <Input
                type="email"
                placeholder="friend@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl glass border-white/10 focus:border-blue-400 text-white placeholder:text-slate-400"
              />
              <Button
                type="submit"
                disabled={!email.trim() || isLoading}
                className="w-full rounded-xl bg-slate-800/50 border border-white/10 hover:bg-slate-700/50 text-white"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                ) : (
                  <Mail className="h-4 w-4 mr-2" />
                )}
                Send Invite
              </Button>
            </form>
          </div>

          {/* Group Code */}
          <div className="text-center p-4 glass border-white/10 rounded-2xl">
            <p className="text-sm text-slate-400 mb-2">Or share this code</p>
            <p className="text-2xl font-mono font-bold text-white">
              {groupCode}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
