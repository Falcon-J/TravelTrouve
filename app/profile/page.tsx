"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  User,
  Mail,
  Trash2,
  ArrowLeft,
  Shield,
  Calendar,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/layout/navbar";
import { updateEmail, deleteUser } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber] = useState(user?.phoneNumber || "");
  const [location] = useState("");
  const [bio] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
      setEmail(user.email || "");
      // Note: phoneNumber, bio and location would come from Firestore user profile
    }
  }, [user]);

  const handleUpdateEmail = async () => {
    if (!user || !email.trim()) return;

    setEmailLoading(true);
    try {
      await updateEmail(user, email.trim());
      toast({
        title: "Email updated",
        description: "Your email has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating email:", error);
      toast({
        title: "Email update failed",
        description: "Failed to update email. You may need to re-authenticate.",
        variant: "destructive",
      });
    } finally {
      setEmailLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    try {
      await deleteUser(user);
      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted.",
      });
      router.push("/");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast({
        title: "Delete failed",
        description:
          "Failed to delete account. You may need to re-authenticate.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-black pt-16 flex items-center justify-center">
          <div className="text-center">
            <p className="text-slate-400">
              Please sign in to view your profile.
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black pt-16 lg:p-8 relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20" />

        {/* Content */}
        <div className="relative">
          <div className="max-w-4xl mx-auto p-6 lg:p-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="mb-4 text-slate-400 hover:text-white hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-3xl font-bold text-white mb-2">
                Profile Settings
              </h1>
              <p className="text-slate-400">
                Manage your account settings and preferences
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Overview */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="glass border-white/10">
                  <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                      <div className="relative">
                        <Avatar className="h-24 w-24">
                          <AvatarImage src={user.photoURL || undefined} />
                          <AvatarFallback className="bg-slate-800/50 border border-white/10 text-white text-2xl">
                            {user.displayName?.charAt(0) ||
                              user.email?.charAt(0) ||
                              "U"}
                          </AvatarFallback>
                        </Avatar>
                       
                      </div>
                    </div>
                    <CardTitle className="text-white">
                      {user.displayName || "User"}
                    </CardTitle>
                    <p className="text-slate-400 text-sm">{user.email}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm text-slate-400">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Joined{" "}
                        {new Date(
                          user.metadata.creationTime || ""
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    {/* <div className="flex items-center space-x-2 text-sm text-slate-400">
                      <Shield className="h-4 w-4" />
                      <span>Account verified</span>
                    </div> */}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Profile Settings */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-2 space-y-6"
              >
                {/* Basic Information */}
                <Card className="glass border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="displayName" className="text-slate-300">
                          Display Name
                        </Label>
                        <Input
                          id="displayName"
                          value={displayName}
                          className="glass border-white/10 text-white mt-1"
                          placeholder="Enter your display name"
                          disabled
                        />
                      </div>
                      <div>
                        <Label htmlFor="location" className="text-slate-300">
                          Location
                        </Label>
                        <Input
                          id="location"
                          value={location}
                          className="glass border-white/10 text-white mt-1"
                          placeholder="Your location"
                          disabled
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="bio" className="text-slate-300">
                        Bio
                      </Label>
                      <textarea
                        id="bio"
                        value={bio}
                        className="w-full mt-1 p-3 glass border-white/10 rounded-md text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none"
                        rows={3}
                        placeholder="Tell us about yourself..."
                        disabled
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Information */}
                <Card className="glass border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email" className="text-slate-300">
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="glass border-white/10 text-white mt-1"
                          placeholder="Enter your email"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone" className="text-slate-300">
                          Phone Number
                        </Label>
                        <Input
                          id="phone"
                          value={phoneNumber}
                          className="glass border-white/10 text-white mt-1"
                          placeholder="Your phone number"
                          disabled
                        />
                      </div>
                    </div>
                    <Button
                      onClick={handleUpdateEmail}
                      disabled={emailLoading || email === user.email}
                      variant="outline"
                      className="border-white/10 text-slate-300 hover:bg-white/10"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      {emailLoading ? "Updating..." : "Update Email"}
                    </Button>
                  </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="glass border-red-500/20">
                  <CardHeader>
                    <CardTitle className="text-red-400 flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Danger Zone
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
                      <div>
                        <h3 className="text-white font-medium mb-1">
                          Delete Account
                        </h3>
                        <p className="text-slate-400 text-sm">
                          Permanently delete your account and all associated
                          data. This action cannot be undone.
                        </p>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            className="bg-red-600/20 border border-red-500/30 hover:bg-red-600/30 text-red-400"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Account
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="glass border-white/10">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-white">
                              Delete Account
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-slate-400">
                              Are you absolutely sure? This action cannot be
                              undone. This will permanently delete your account
                              and remove all your data from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="glass border-white/10 text-slate-300 hover:bg-white/10">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDeleteAccount}
                              className="bg-red-600/20 border border-red-500/30 hover:bg-red-600/30 text-red-400"
                            >
                              Delete Account
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
