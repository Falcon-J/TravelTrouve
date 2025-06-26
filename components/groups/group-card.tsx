"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Users, Calendar, ArrowRight, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import type { Group } from "@/types/group";

interface GroupCardProps {
  group: Group & { role: "Admin" | "Member" };
  onEnterGroupAction: (group: Group) => void;
}

export function GroupCard({ group, onEnterGroupAction }: GroupCardProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopyCode = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(group.code);
      setCopied(true);
      toast({
        title: "Code copied!",
        description: "Group code has been copied to clipboard",
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

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="group cursor-pointer"
    >
      <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl">
        {/* Photo Preview */}
        <div className="relative h-40 bg-gradient-to-br from-slate-900 to-slate-800 overflow-hidden">
          {group.recentPhotos.length > 0 ? (
            <div className="flex h-full">
              {group.recentPhotos.slice(0, 3).map((photo, index) => (
                <div
                  key={index}
                  className="relative flex-1 overflow-hidden"
                  style={{ marginLeft: index > 0 ? "-1px" : "0" }}
                >
                  <Image
                    src={"/placeholder.svg"}
                    alt={`Recent photo ${index + 1}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <Users className="h-12 w-12 text-slate-700" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
        </div>

        <CardContent className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-white truncate mb-1">
                {group.name}
              </h3>
              <div className="flex items-center text-sm text-slate-400">
                <Calendar className="h-3.5 w-3.5 mr-1.5" />
                Created{" "}
                {(() => {
                  if (group.createdAt instanceof Date) {
                    return group.createdAt.toLocaleDateString();
                  }
                  if (group.createdAt && typeof group.createdAt === "object") {
                    // Firebase Timestamp object
                    const timestamp = group.createdAt as {
                      seconds?: number;
                      toDate?: () => Date;
                    };
                    if (timestamp.seconds) {
                      return new Date(
                        timestamp.seconds * 1000
                      ).toLocaleDateString();
                    }
                    if (
                      timestamp.toDate &&
                      typeof timestamp.toDate === "function"
                    ) {
                      return timestamp.toDate().toLocaleDateString();
                    }
                  }
                  return "Recently";
                })()}
              </div>
            </div>
            <Badge
              variant={group.role === "Admin" ? "default" : "secondary"}
              className={`rounded-full px-2.5 py-0.5 ${
                group.role === "Admin"
                  ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                  : "bg-slate-800 text-slate-300 border-slate-700"
              }`}
            >
              {group.role}
            </Badge>
          </div>

          {/* Group Code */}
          <div className="flex items-center justify-between mb-4 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <div>
              <p className="text-xs text-slate-400 mb-1">Group Code</p>
              <p className="font-mono text-sm text-white">{group.code}</p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg"
              onClick={handleCopyCode}
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center text-slate-400">
              <Users className="h-4 w-4 mr-1.5" />
              <span className="text-sm">
                {group.memberCount} member{group.memberCount !== 1 ? "s" : ""}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg -mr-2 hover:cursor-pointer"
              onClick={() => onEnterGroupAction(group)}
            >
              View Group
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
