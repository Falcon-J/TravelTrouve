"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Camera,
  Bell,
  Settings,
  LogOut,
  ChevronDown,
  Home,
  UserCircle,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

interface AutoHideNavbarProps {
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  className?: string;
}

export function AutoHideNavbar({
  title = "TravelTrouve",
  subtitle = "Your Travel Memories",
  showBackButton = false,
  onBackClick,
  className = "",
}: AutoHideNavbarProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show navbar when scrolling up, hide when scrolling down
      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "Hope to see you again soon!",
      });
    } catch {
      toast({
        title: "Error signing out",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const navbarVariants = {
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
    hidden: {
      y: -100,
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: "easeIn",
      },
    },
  };

  return (
    <AnimatePresence>
      <motion.nav
        variants={navbarVariants}
        animate={isVisible ? "visible" : "hidden"}
        className={`fixed top-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/50 shadow-lg ${className}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left section */}
            <div className="flex items-center space-x-4">
              {showBackButton && onBackClick && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBackClick}
                  className="text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl"
                >
                  <ChevronDown className="h-4 w-4 mr-2 rotate-90" />
                  Back
                </Button>
              )}

              <Link href="/dashboard" className="flex items-center space-x-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-30" />
                  <Camera className="relative h-8 w-8 text-blue-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {title}
                  </h1>
                  <p className="text-xs text-slate-400 hidden sm:block">
                    {subtitle}
                  </p>
                </div>
              </Link>
            </div>

            {/* Right section */}
            <div className="flex items-center space-x-3">
              {user && (
                <>
                  {/* Navigation Links */}
                  <div className="hidden md:flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl"
                      asChild
                    >
                      <Link href="/dashboard">
                        <Home className="h-4 w-4 mr-2" />
                        Dashboard
                      </Link>
                    </Button>
                  </div>

                  {/* Notification Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl relative"
                  >
                    <Bell className="h-4 w-4" />
                    <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                  </Button>

                  {/* User Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="relative h-10 w-10 rounded-full ring-2 ring-slate-700 hover:ring-slate-600 transition-all"
                      >
                        <Avatar className="h-9 w-9">
                          <AvatarImage
                            src={user.photoURL || ""}
                            alt={user.displayName || "User"}
                          />
                          <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-sm font-medium">
                            {user.displayName?.charAt(0) ||
                              user.email?.charAt(0) ||
                              "U"}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-56 bg-slate-900 border-slate-700 rounded-xl"
                    >
                      <DropdownMenuLabel className="text-slate-300">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium text-white">
                            {user.displayName || "User"}
                          </p>
                          <p className="text-xs text-slate-400">{user.email}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-slate-700" />

                      <DropdownMenuItem className="text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg mx-1">
                        <UserCircle className="mr-2 h-4 w-4" />
                        Profile
                      </DropdownMenuItem>

                      <DropdownMenuItem className="text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg mx-1">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </DropdownMenuItem>

                      <DropdownMenuSeparator className="bg-slate-700" />

                      <DropdownMenuItem
                        onClick={handleSignOut}
                        className="text-red-400 hover:bg-red-900/20 hover:text-red-300 rounded-lg mx-1"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}

              {!user && (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl"
                    asChild
                  >
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl"
                    asChild
                  >
                    <Link href="/signup">Sign Up</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.nav>
    </AnimatePresence>
  );
}
