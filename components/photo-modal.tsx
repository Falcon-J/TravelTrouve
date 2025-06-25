"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, X, Send } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"
import type { Photo } from "@/app/page"

interface PhotoModalProps {
  photo: Photo | null
  isOpen: boolean
  onClose: () => void
}

const mockComments = [
  {
    id: "1",
    author: { name: "Alice Johnson", avatar: "/placeholder.svg?height=32&width=32" },
    text: "Absolutely stunning! 😍",
    timestamp: "1h ago",
  },
  {
    id: "2",
    author: { name: "Bob Smith", avatar: "/placeholder.svg?height=32&width=32" },
    text: "I was there last year, brings back memories!",
    timestamp: "2h ago",
  },
  {
    id: "3",
    author: { name: "Carol Davis", avatar: "/placeholder.svg?height=32&width=32" },
    text: "Adding this to my bucket list!",
    timestamp: "3h ago",
  },
]

export function PhotoModal({ photo, isOpen, onClose }: PhotoModalProps) {
  const [newComment, setNewComment] = useState("")

  if (!photo) return null

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (newComment.trim()) {
      // Handle comment submission
      setNewComment("")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0 overflow-hidden rounded-2xl">
        <div className="flex flex-col lg:flex-row h-full max-h-[90vh]">
          {/* Image */}
          <div className="flex-1 relative bg-black">
            <Image src={photo.src || "/placeholder.svg"} alt={photo.caption} fill className="object-contain" />
          </div>

          {/* Content */}
          <div className="lg:w-96 flex flex-col bg-white">
            {/* Header */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={photo.author.avatar || "/placeholder.svg"} />
                    <AvatarFallback>
                      {photo.author.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900">{photo.author.name}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {photo.timestamp}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <p className="text-gray-800 mb-3">{photo.caption}</p>

              <div className="flex items-center text-sm text-gray-500 mb-4">
                <MapPin className="h-4 w-4 mr-1" />
                {photo.location}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {photo.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs rounded-full">
                    #{tag}
                  </Badge>
                ))}
              </div>

              {/* Reactions */}
              <div className="flex items-center space-x-4">
                {photo.reactions.map((reaction, index) => (
                  <motion.button
                    key={index}
                    className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 transition-colors"
                    whileTap={{ scale: 0.9 }}
                  >
                    <span className="text-lg">{reaction.emoji}</span>
                    <span className="text-sm font-medium">{reaction.count}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Comments */}
            <div className="flex-1 overflow-y-auto p-4">
              <h4 className="font-medium text-gray-900 mb-4">Comments</h4>
              <div className="space-y-4">
                {mockComments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.author.avatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {comment.author.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="text-sm font-medium text-gray-900">{comment.author.name}</p>
                        <p className="text-xs text-gray-500">{comment.timestamp}</p>
                      </div>
                      <p className="text-sm text-gray-700">{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Comment Input */}
            <div className="p-4 border-t">
              <form onSubmit={handleSubmitComment} className="flex space-x-2">
                <Input
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 rounded-2xl"
                />
                <Button type="submit" size="sm" className="rounded-2xl">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
