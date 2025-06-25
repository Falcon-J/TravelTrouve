"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EditProfileModal } from "@/components/edit-profile-modal"
import {
  MapPin,
  Calendar,
  Camera,
  Users,
  Edit3,
  Settings,
  Trophy,
  Heart,
  MessageCircle,
  Share2,
  ImageIcon,
} from "lucide-react"
import type { User as UserType, Group } from "@/app/page"

interface ProfileViewProps {
  user: UserType
  groups: Group[]
}

const achievements = [
  { id: 1, title: "First Photo", description: "Upload your first photo", icon: Camera, earned: false },
  { id: 2, title: "Group Creator", description: "Create your first group", icon: Users, earned: false },
  { id: 3, title: "Explorer", description: "Visit 5 different countries", icon: MapPin, earned: false },
  { id: 4, title: "Social Butterfly", description: "Receive 100 likes", icon: Heart, earned: false },
  { id: 5, title: "Storyteller", description: "Post 50 photos", icon: MessageCircle, earned: false },
  { id: 6, title: "Influencer", description: "Share content 25 times", icon: Share2, earned: false },
]

export function ProfileView({ user, groups }: ProfileViewProps) {
  const [activeTab, setActiveTab] = useState("photos")
  const [showEditModal, setShowEditModal] = useState(false)

  const userGroups = groups.filter((group) => group.role === "Admin" || group.role === "Member")
  const adminGroups = groups.filter((group) => group.role === "Admin")

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="rounded-2xl shadow-lg bg-gray-900 border-gray-800 mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
              {/* Avatar */}
              <div className="relative">
                <Avatar className="h-32 w-32 ring-4 ring-blue-500">
                  <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-3xl">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{user.name}</h1>
                    <p className="text-gray-400 mb-2">{user.email}</p>
                    {user.location && (
                      <div className="flex items-center text-gray-400 mb-2">
                        <MapPin className="h-4 w-4 mr-2" />
                        {user.location}
                      </div>
                    )}
                    {user.joinedDate && (
                      <div className="flex items-center text-gray-400">
                        <Calendar className="h-4 w-4 mr-2" />
                        Joined {new Date(user.joinedDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3 mt-4 sm:mt-0">
                    <Button
                      onClick={() => setShowEditModal(true)}
                      variant="outline"
                      className="rounded-2xl border-gray-700 text-white hover:bg-gray-800"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button variant="outline" className="rounded-2xl border-gray-700 text-white hover:bg-gray-800">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Bio */}
                {user.bio ? (
                  <p className="text-gray-300 mb-4 max-w-2xl">{user.bio}</p>
                ) : (
                  <p className="text-gray-500 mb-4 max-w-2xl italic">No bio added yet</p>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{user.totalPhotos || 0}</div>
                    <div className="text-sm text-gray-400">Photos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{user.totalGroups || 0}</div>
                    <div className="text-sm text-gray-400">Groups</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{adminGroups.length}</div>
                    <div className="text-sm text-gray-400">Admin</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Content Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-900 rounded-2xl p-1">
            <TabsTrigger value="photos" className="rounded-xl data-[state=active]:bg-gray-800 text-white">
              <Camera className="h-4 w-4 mr-2" />
              Photos
            </TabsTrigger>
            <TabsTrigger value="groups" className="rounded-xl data-[state=active]:bg-gray-800 text-white">
              <Users className="h-4 w-4 mr-2" />
              Groups
            </TabsTrigger>
            <TabsTrigger value="achievements" className="rounded-xl data-[state=active]:bg-gray-800 text-white">
              <Trophy className="h-4 w-4 mr-2" />
              Achievements
            </TabsTrigger>
            <TabsTrigger value="activity" className="rounded-xl data-[state=active]:bg-gray-800 text-white">
              <Heart className="h-4 w-4 mr-2" />
              Activity
            </TabsTrigger>
          </TabsList>

          {/* Photos Tab */}
          <TabsContent value="photos" className="mt-8">
            <div className="text-center py-12">
              <ImageIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No photos yet</h3>
              <p className="text-gray-400 mb-6">Start sharing your travel memories by uploading your first photo</p>
              <Button className="rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Camera className="h-4 w-4 mr-2" />
                Upload Photo
              </Button>
            </div>
          </TabsContent>

          {/* Groups Tab */}
          <TabsContent value="groups" className="mt-8">
            {userGroups.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userGroups.map((group, index) => (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="rounded-2xl shadow-lg bg-gray-900 border-gray-800 hover:shadow-2xl transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-white truncate">{group.name}</h3>
                          <Badge variant={group.role === "Admin" ? "default" : "secondary"} className="rounded-full">
                            {group.role}
                          </Badge>
                        </div>
                        <div className="flex items-center text-gray-400 text-sm mb-4">
                          <Users className="h-4 w-4 mr-2" />
                          {group.memberCount} members
                        </div>
                        <div className="flex items-center text-gray-400 text-sm">
                          <Calendar className="h-4 w-4 mr-2" />
                          Created {new Date(group.createdAt).toLocaleDateString()}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No groups yet</h3>
                <p className="text-gray-400 mb-6">Create your first group or join an existing one to get started</p>
                <div className="flex justify-center gap-3">
                  <Button className="rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Create Group
                  </Button>
                  <Button variant="outline" className="rounded-2xl border-gray-700 text-white hover:bg-gray-800">
                    Join Group
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card
                    className={`rounded-2xl shadow-lg border-gray-800 transition-all duration-300 ${
                      achievement.earned
                        ? "bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-yellow-500/30"
                        : "bg-gray-900"
                    }`}
                  >
                    <CardContent className="p-6 text-center">
                      <div
                        className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                          achievement.earned ? "bg-gradient-to-r from-yellow-500 to-orange-500" : "bg-gray-700"
                        }`}
                      >
                        <achievement.icon
                          className={`h-8 w-8 ${achievement.earned ? "text-white" : "text-gray-400"}`}
                        />
                      </div>
                      <h3
                        className={`text-lg font-semibold mb-2 ${
                          achievement.earned ? "text-yellow-400" : "text-gray-400"
                        }`}
                      >
                        {achievement.title}
                      </h3>
                      <p className="text-gray-400 text-sm">{achievement.description}</p>
                      {achievement.earned && (
                        <Badge className="mt-3 bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Earned</Badge>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="mt-8">
            <Card className="rounded-2xl shadow-lg bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Heart className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No activity yet</h3>
                  <p className="text-gray-400">Your recent activity will appear here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Edit Profile Modal */}
      <EditProfileModal open={showEditModal} onOpenChange={setShowEditModal} user={user} />
    </div>
  )
}
