"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, MessageCircle, Share2, Bookmark } from "lucide-react"
import Image from "next/image"
import type { Photo } from "@/app/page"

interface PhotoCardProps {
  photo: Photo
  onClick: () => void
  viewMode?: "grid" | "list"
}

export function PhotoCard({ photo, onClick, viewMode = "grid" }: PhotoCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(false)

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsBookmarked(!isBookmarked)
  }

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (navigator.share) {
      navigator.share({
        title: `Photo by ${photo.author.name}`,
        text: photo.caption,
        url: window.location.href,
      })
    }
  }

  if (viewMode === "list") {
    return (
      <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }} className="cursor-pointer" onClick={onClick}>
        <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
          <div className="flex">
            <div className="relative w-48 h-32 flex-shrink-0">
              <Image src={photo.src || "/placeholder.svg"} alt={photo.caption} fill className="object-cover" />
            </div>
            <CardContent className="flex-1 p-4">
              <div className="flex items-center space-x-3 mb-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={photo.author.avatar || "/placeholder.svg"} />
                  <AvatarFallback>
                    {photo.author.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{photo.author.name}</p>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="h-3 w-3 mr-1" />
                    {photo.timestamp}
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-800 mb-3 line-clamp-2">{photo.caption}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="h-4 w-4 mr-1" />
                  {photo.location}
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    {photo.reactions.map((reaction, index) => (
                      <span key={index} className="text-sm">
                        {reaction.emoji}
                        {reaction.count}
                      </span>
                    ))}
                  </div>
                  <span className="flex items-center text-sm text-gray-500">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    {photo.commentCount}
                  </span>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="cursor-pointer group"
      onClick={onClick}
    >
      <Card className="overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl bg-white/80 backdrop-blur-sm">
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={photo.src || "/placeholder.svg"}
            alt={photo.caption}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Hover Actions */}
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="secondary"
                className="rounded-full bg-white/90 backdrop-blur-sm"
                onClick={handleBookmark}
              >
                <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="rounded-full bg-white/90 backdrop-blur-sm"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <CardContent className="p-4">
          <div className="flex items-center space-x-3 mb-3">
            <Avatar className="h-8 w-8 ring-2 ring-white shadow-sm">
              <AvatarImage src={photo.author.avatar || "/placeholder.svg"} />
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs">
                {photo.author.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{photo.author.name}</p>
              <div className="flex items-center text-xs text-gray-500">
                <Clock className="h-3 w-3 mr-1" />
                {photo.timestamp}
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-800 mb-3 line-clamp-2 leading-relaxed">{photo.caption}</p>

          <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1 text-blue-500" />
              <span className="font-medium">{photo.location}</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            {photo.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs rounded-full">
                #{tag}
              </Badge>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {photo.reactions.map((reaction, index) => (
                <motion.button
                  key={index}
                  className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors"
                  whileTap={{ scale: 0.9 }}
                >
                  <span className="text-sm">{reaction.emoji}</span>
                  <span className="text-xs font-medium">{reaction.count}</span>
                </motion.button>
              ))}
            </div>
            <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors">
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm font-medium">{photo.commentCount}</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
