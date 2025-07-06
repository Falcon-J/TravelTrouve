"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, ArrowRight } from "lucide-react";
import type { Group } from "@/types/group";

interface GroupCardProps {
  group: Group & { role: "Admin" | "Member" };
  onEnterGroupAction: (group: Group) => void;
}

export function GroupCard({ group, onEnterGroupAction }: GroupCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="group cursor-pointer"
    >
      <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl glass border-white/10">
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
              className="text-slate-300 hover:text-white hover:bg-white/10 rounded-lg -mr-2 hover:cursor-pointer"
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
