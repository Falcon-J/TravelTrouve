"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Progress } from "@/components/ui/progress";
import { GoogleIcon } from "@/components/ui/icons";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [progressStage, setProgressStage] = useState(0);
  const router = useRouter();
  const { signInWithEmail, signInWithGoogle } = useAuth();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAuthError = (error: { code?: string }) => {
    setIsLoading(false);
    setProgressStage(0);

    const errorMessages: Record<string, string> = {
      "auth/wrong-password": "Incorrect password. Please try again.",
      "auth/user-not-found": "No account found with this email.",
      "auth/too-many-requests": "Too many attempts. Please try again later.",
      "auth/popup-closed-by-user": "Sign in was cancelled.",
      "auth/network-request-failed":
        "Network error. Please check your connection.",
    };

    const errorMessage =
      error.code && errorMessages[error.code]
        ? errorMessages[error.code]
        : "An unexpected error occurred. Please try again.";

    toast({
      title: "Authentication Error",
      description: errorMessage,
      variant: "destructive",
    });
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setProgressStage(25);

    try {
      await signInWithEmail(formData.email, formData.password);
      setProgressStage(75);
      toast({
        title: "Welcome back!",
        description: "Successfully logged in.",
      });
      setProgressStage(100);
      router.push("/dashboard");
    } catch (error: any) {
      handleAuthError(error);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setProgressStage(25);

    try {
      await signInWithGoogle();
      setProgressStage(75);
      toast({
        title: "Welcome!",
        description: "Successfully signed in with Google.",
      });
      setProgressStage(100);
      router.push("/dashboard");
    } catch (error: any) {
      handleAuthError(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 to-black">
      {progressStage > 0 && (
        <motion.div
          className="fixed top-0 left-0 right-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Progress value={progressStage} className="h-1" />
        </motion.div>
      )}

      <div className="flex-1 flex items-center justify-center p-4 min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="p-8 bg-blue-950/50 backdrop-blur-xl border border-blue-800/50">
            <form onSubmit={handleEmailLogin} className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
                <p className="text-blue-200/80">
                  Sign in to continue your journey
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading}
                    required
                    className="bg-blue-900/30 border-blue-800/50"
                  />
                </div>

                <div className="space-y-2">
                  <Input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                    required
                    className="bg-blue-900/30 border-blue-800/50"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500"
                disabled={isLoading}
              >
                {isLoading ? <LoadingSpinner /> : "Sign In"}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-blue-800/50" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-blue-400">Or</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full border-blue-800/50 hover:bg-blue-900/30"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <GoogleIcon className="mr-2 h-4 w-4" />
                Continue with Google
              </Button>

              <p className="text-center text-sm text-blue-300/80">
                Don't have an account?{" "}
                <Link
                  href="/signup"
                  className="font-medium text-blue-400 hover:text-blue-300"
                >
                  Sign up
                </Link>
              </p>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
