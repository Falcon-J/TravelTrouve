"use client"

import { cn } from "@/lib/utils"
import { Home, Camera, Users, Map, Settings } from "lucide-react"

interface SidebarProps {
  activeView: string
  setActiveView: (view: string) => void
}

const navItems = [
  { id: "feed", label: "Trip Feed", icon: Home },
  { id: "upload", label: "Upload Photo", icon: Camera },
  { id: "members", label: "Trip Members", icon: Users },
  { id: "map", label: "Map View", icon: Map },
  { id: "settings", label: "Settings", icon: Settings },
]

export function Sidebar({ activeView, setActiveView }: SidebarProps) {
  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:w-64 lg:flex lg:flex-col lg:bg-white lg:border-r lg:border-gray-200 lg:pt-20">
      <div className="flex-1 flex flex-col min-h-0 px-4 py-6">
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={cn(
                  "w-full flex items-center px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-200",
                  activeView === item.id
                    ? "bg-blue-50 text-blue-700 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                )}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.label}
              </button>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
