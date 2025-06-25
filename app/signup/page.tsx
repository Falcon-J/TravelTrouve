"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Progress } from "@/components/ui/progress";

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [signupProgress, setSignupProgress] = useState(0);
  const router = useRouter();
  const { signUpWithEmail, signInWithGoogle } = useAuth();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name",
        variant: "destructive",
      });
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please ensure both passwords are the same",
        variant: "destructive",
      });
      return false;
    }
    if (formData.password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const updateSignupProgress = () => {
    setSignupProgress(33);
    setTimeout(() => setSignupProgress(66), 500);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setSignupProgress(0);

    toast({
      title: "Creating your account...",
      description: "Please wait while we set up your profile",
    });

    updateSignupProgress();

    try {
      await signUpWithEmail(formData.email, formData.password, formData.name);
      setSignupProgress(100);
      toast({
        title: "Welcome aboard! 🎉",
        description: "Your account has been created successfully!",
      });
      router.push("/login");
    } catch (error: any) {
      setSignupProgress(0);
      if (error.code === "auth/email-already-in-use") {
        toast({
          title: "Account exists",
          description: "Please login instead.",
          variant: "destructive",
        });
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        toast({
          title: "Error",
          description: error.message || "An error occurred during signup.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    setSignupProgress(0);

    toast({
      title: "Connecting to Google...",
      description: "Please complete the Google sign-in process",
    });

    updateSignupProgress();

    try {
      await signInWithGoogle();
      setSignupProgress(100);
      toast({
        title: "Welcome! 🎉",
        description: "Successfully signed in with Google",
      });
      router.push("/dashboard");
    } catch (error: any) {
      setSignupProgress(0);
      toast({
        title: "Error",
        description: error.message || "Failed to sign in with Google.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-950 to-black">
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 bg-blue-950/50 backdrop-blur-xl border border-blue-800/50">
          <form onSubmit={handleSignUp} className="space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="text-3xl font-bold text-blue-400">
                Create Account
              </h2>
              <p className="text-gray-400 text-sm">
                Start your journey with TravelTrouve
              </p>
            </div>

            {signupProgress > 0 && (
              <Progress value={signupProgress} className="h-1 mb-4" />
            )}

            <div className="space-y-4">
              <Input
                type="text"
                name="name"
                placeholder="Full Name"
                className="w-full bg-blue-900/30 border-blue-800/50 text-white placeholder:text-gray-400"
                value={formData.name}
                onChange={handleChange}
                disabled={isLoading}
                required
              />

              <Input
                type="email"
                name="email"
                placeholder="Email"
                className="w-full bg-blue-900/30 border-blue-800/50 text-white placeholder:text-gray-400"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                required
              />

              <Input
                type="password"
                name="password"
                placeholder="Password"
                className="w-full bg-blue-900/30 border-blue-800/50 text-white placeholder:text-gray-400"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                required
              />

              <Input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                className="w-full bg-blue-900/30 border-blue-800/50 text-white placeholder:text-gray-400"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <LoadingSpinner className="mr-2" />
                  Creating Account...
                </span>
              ) : (
                "Create Account"
              )}
            </Button>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-blue-800/50 w-full"></div>
              <span className="bg-transparent px-2 text-gray-400 text-sm">
                or 
              </span>
              <div className="border-t border-blue-800/50 w-full"></div>
            </div>

            <Button
              type="button"
              onClick={handleGoogleSignUp}
              className="w-full bg-blue-900/30 hover:bg-blue-800/50 text-white border border-blue-700/50"
              disabled={isLoading}
            >
              {isLoading && formData.email === "" ? (
                <span className="flex items-center justify-center">
                  <LoadingSpinner className="mr-2" />
                  Connecting to Google...
                </span>
              ) : (
                <>
                  <svg
                    className="w-5 h-5 mr-2"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-gray-400 text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-400 hover:text-blue-300">
              Login here
            </Link>
          </p>
        </Card>
      </div>
      
    </div>
  );
}
