"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Home,
  Upload,
  Users,
  Map,
  Settings,
  Menu,
  X,
  Crown,
} from "lucide-react";

import type { GroupViewType } from "@/components/groups/group-view";

import type { Group } from "@/types/group";
// import type { User } from "@/types/user";



interface GroupSidebarProps {
  group: Group;
  activeView: GroupViewType;
  setActiveViewAction: (view: GroupViewType) => void;
  sidebarOpen: boolean;
  setSidebarOpenAction: (open: boolean) => void;
}

const navItems = [
  { id: "feed" as GroupViewType, label: "Group Feed", icon: Home },
  { id: "upload" as GroupViewType, label: "Upload Photo", icon: Upload },
  { id: "members" as GroupViewType, label: "Members", icon: Users },
  { id: "map" as GroupViewType, label: "Map View", icon: Map },
  {
    id: "settings" as GroupViewType,
    label: "Settings",
    icon: Settings,
    adminOnly: true,
  },
];


export function GroupSidebar({
  group,
  activeView,
  setActiveViewAction,
  sidebarOpen,
  setSidebarOpenAction,
}: GroupSidebarProps) {

  // Determine if the current user is an admin of the group
  const isAdmin = group?.role === "Admin";

  const filteredNavItems = navItems.filter(
    (item) => !item.adminOnly || isAdmin
  );

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden rounded-full hover:bg-slate-800/50 text-white"
        onClick={() => setSidebarOpenAction(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 bg-slate-900/95 backdrop-blur-xl border-r border-slate-800 shadow-lg transform transition-all duration-300 ease-out lg:translate-x-0 lg:static lg:inset-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ paddingTop: "3.5rem" }}
      >
        <div className="flex flex-col h-full">
          {/* Group Header */}
          <div className="px-4 py-3 border-b border-slate-800">
            <div className="flex items-start gap-4 mb-3">
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-white tracking-tight mb-1">
                  {group.name}
                </h2>
              
              </div>
              {isAdmin && (
                <Badge
                  variant="secondary"
                  className="rounded-full px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20"
                >
                  <Crown className="h-3.5 w-3.5 mr-1.5" />
                  Admin
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Users className="h-4 w-4" />
              <span className="text-sm">
                {group.memberCount} member{group.memberCount !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3">
            <div className="space-y-1">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start rounded-lg py-4 transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-md hover:shadow-lg hover:from-blue-700 hover:to-violet-700"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                    )}
                    onClick={() => {
                      setActiveViewAction(item.id);
                      setSidebarOpenAction(false);
                    }}
                  >
                    <Icon
                      className={cn(
                        "mr-3 h-4 w-4",
                        isActive ? "text-white" : "text-slate-400"
                      )}
                    />
                    <span className="font-medium">{item.label}</span>
                  </Button>
                );
              })}
            </div>
          </nav>
        </div>
      </aside>
    </>
  );
}
