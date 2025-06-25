"use client"

import { cn } from "@/lib/utils"
import { Home, Camera, Users, Map, Settings } from "lucide-react"

interface MobileNavProps {
  activeView: string
  setActiveView: (view: string) => void
}

const navItems = [
  { id: "feed", icon: Home },
  { id: "upload", icon: Camera },
  { id: "members", icon: Users },
  { id: "map", icon: Map },
  { id: "settings", icon: Settings },
]

export function MobileNav({ activeView, setActiveView }: MobileNavProps) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-200",
                activeView === item.id ? "text-blue-600" : "text-gray-400 hover:text-gray-600",
              )}
            >
              <Icon className="h-6 w-6" />
            </button>
          )
        })}
      </div>
    </nav>
  )
}
