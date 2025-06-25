"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserPlus, Users, MapPin } from "lucide-react"

export function TripMembers() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Trip Members</h2>
        <p className="text-gray-400">Manage your travel companions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="rounded-2xl shadow-lg bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">Members (0)</CardTitle>
              <Button className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Member
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No members yet</h3>
                <p className="text-gray-400 mb-6">Invite friends to join your travel group</p>
                <Button className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Invite First Member
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-2xl shadow-lg bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Trip Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Total Photos</span>
                <span className="font-semibold text-white">0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Locations Visited</span>
                <span className="font-semibold text-white">0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Trip Duration</span>
                <span className="font-semibold text-white">-</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Most Active</span>
                <span className="font-semibold text-white">-</span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-lg bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <MapPin className="mr-2 h-5 w-5" />
                Recent Locations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No locations visited yet</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
