"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Save, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { User } from "@/app/page"

interface EditProfileModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User
}

export function EditProfileModal({ open, onOpenChange, user }: EditProfileModalProps) {
  const [name, setName] = useState(user.name)
  const [bio, setBio] = useState(user.bio || "")
  const [location, setLocation] = useState(user.location || "")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: "Profile updated!",
      description: "Your profile has been updated successfully",
    })

    setIsLoading(false)
    onOpenChange(false)
  }

  const handleAvatarChange = () => {
    // Handle avatar upload
    toast({
      title: "Avatar upload",
      description: "Avatar upload functionality would be implemented here",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl text-white">
            <Camera className="mr-2 h-5 w-5 text-blue-400" />
            Edit Profile
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="h-24 w-24 ring-4 ring-blue-500">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xl">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <Button
                type="button"
                size="sm"
                onClick={handleAvatarChange}
                className="absolute -bottom-2 -right-2 rounded-full bg-blue-600 hover:bg-blue-700"
              >
                <Camera className="h-3 w-3" />
              </Button>
            </div>
            <p className="text-sm text-gray-400">Click the camera icon to change your avatar</p>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-semibold text-gray-300">
                Full Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 rounded-xl border-gray-700 bg-gray-800 text-white focus:border-blue-500"
                required
              />
            </div>

            <div>
              <Label htmlFor="bio" className="text-sm font-semibold text-gray-300">
                Bio
              </Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="mt-2 rounded-xl border-gray-700 bg-gray-800 text-white focus:border-blue-500 min-h-[80px]"
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-1">{bio.length}/200 characters</p>
            </div>

            <div>
              <Label htmlFor="location" className="text-sm font-semibold text-gray-300">
                Location
              </Label>
              <Input
                id="location"
                placeholder="City, Country"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="mt-2 rounded-xl border-gray-700 bg-gray-800 text-white focus:border-blue-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-xl border-gray-700 text-white hover:bg-gray-800"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || isLoading}
              className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
