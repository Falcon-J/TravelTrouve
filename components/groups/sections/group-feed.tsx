import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Filter,
  Grid3X3,
  List,
  ImageIcon,
  Camera,
  Heart,
  MessageCircle,
  MapPin,
  Calendar,
  Download,
  MoreHorizontal,
  Send,
  X,
} from "lucide-react";
import Image from "next/image";
import type { Group } from "@/types/group";
import type { Photo, Comment } from "@/types/photo";
import {
  getAllGroupPhotos,
  togglePhotoLike,
  addCommentToPhoto,
  getPhotoComments,
} from "@/lib/photo-utils";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface GroupFeedProps {
  group: Group;
}

export function GroupFeed({ group }: GroupFeedProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching photos for group:", group.id);
      const groupPhotos = await getAllGroupPhotos(group.id);
      console.log("Fetched photos with user info:", groupPhotos);
      setPhotos(groupPhotos);
    } catch (error) {
      console.error("Error fetching photos:", error);
      setError("Failed to load photos");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (photoId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to like photos",
        variant: "destructive",
      });
      return;
    }

    try {
      await togglePhotoLike(group.id, photoId, user.uid);

      // Update the specific photo in the state instead of refreshing all photos
      setPhotos((prevPhotos) =>
        prevPhotos.map((photo) => {
          if (photo.id === photoId) {
            const isCurrentlyLiked = photo.likes?.includes(user.uid) || false;
            const newLikes = isCurrentlyLiked
              ? photo.likes?.filter((id) => id !== user.uid) || []
              : [...(photo.likes || []), user.uid];

            return {
              ...photo,
              likes: newLikes,
              likeCount: newLikes.length,
            };
          }
          return photo;
        })
      );

      toast({
        title: "Success",
        description: "Photo like toggled",
      });
    } catch (error) {
      console.error("Error toggling like:", error);
      toast({
        title: "Error",
        description: "Failed to like photo",
        variant: "destructive",
      });
    }
  };

  const downloadPhoto = (photo: Photo, isOriginal: boolean = false) => {
    try {
      const dataUrl = photo.imageData || photo.url;
      const link = document.createElement("a");
      link.href = dataUrl;

      // Get the file extension from the original file type
      const fileExtension = photo.fileType
        ? photo.fileType.split("/")[1]
        : "jpg";
      const baseFilename = photo.originalName
        ? photo.originalName.split(".")[0]
        : photo.filename?.split(".")[0] || "photo";

      const filename = `${baseFilename}_${
        isOriginal ? "original" : "compressed"
      }.${fileExtension}`;

      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download Started",
        description: `Downloading ${
          isOriginal ? "original" : "compressed"
        } photo as ${filename}`,
      });
    } catch (error) {
      console.error("Error downloading photo:", error);
      toast({
        title: "Download Failed",
        description: "Failed to download photo",
        variant: "destructive",
      });
    }
  };

  const handleComment = async (photo: Photo) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to view comments",
        variant: "destructive",
      });
      return;
    }

    setSelectedPhoto(photo);
    setShowComments(true);
    setLoadingComments(true);

    try {
      const photoComments = await getPhotoComments(group.id, photo.id);
      setComments(photoComments);
    } catch (error) {
      console.error("Error loading comments:", error);
      toast({
        title: "Error",
        description: "Failed to load comments",
        variant: "destructive",
      });
    } finally {
      setLoadingComments(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!user || !selectedPhoto || !newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const comment = await addCommentToPhoto(
        group.id,
        selectedPhoto.id,
        user.uid,
        newComment.trim()
      );

      setComments((prev) => [comment, ...prev]);
      setNewComment("");

      // Update the photo's comment count in the photos list
      setPhotos((prev) =>
        prev.map((p) =>
          p.id === selectedPhoto.id
            ? { ...p, commentCount: (p.commentCount || 0) + 1 }
            : p
        )
      );

      toast({
        title: "Comment Added",
        description: "Your comment has been posted successfully",
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    } finally {
      setSubmittingComment(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, [group.id]);

  // Filter photos based on search term
  const filteredPhotos = photos.filter((photo) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      photo.description?.toLowerCase().includes(searchLower) ||
      photo.location?.toLowerCase().includes(searchLower) ||
      photo.tags?.some((tag) => tag.toLowerCase().includes(searchLower)) ||
      photo.originalName?.toLowerCase().includes(searchLower) ||
      photo.user?.displayName?.toLowerCase().includes(searchLower) ||
      photo.userId.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="max-w-7xl mx-auto">
      {/* Controls */}
      <motion.div
        className="mb-8 space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search photos, locations, users, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-2xl border-gray-700 bg-gray-900 text-white focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-xl"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-xl"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-gray-700 text-white hover:bg-gray-800"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button
              onClick={fetchPhotos}
              variant="outline"
              size="sm"
              className="rounded-xl border-gray-700 text-white hover:bg-gray-800"
              disabled={loading}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                "Refresh"
              )}
            </Button>
          </div>
        </div>

        {/* Photo count display */}
        {photos.length > 0 && (
          <div className="text-sm text-gray-400">
            {photos.length === filteredPhotos.length
              ? `Showing all ${photos.length} photo${
                  photos.length !== 1 ? "s" : ""
                }`
              : `Showing ${filteredPhotos.length} of ${photos.length} photo${
                  photos.length !== 1 ? "s" : ""
                }`}
          </div>
        )}
      </motion.div>

      {/* Loading State */}
      {loading && (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-400">Loading photos...</p>
        </motion.div>
      )}

      {/* Error State */}
      {error && !loading && (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <ImageIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            Error loading photos
          </h3>
          <p className="text-gray-400 mb-6">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Try Again
          </Button>
        </motion.div>
      )}

      {/* Photos Grid */}
      {!loading && !error && filteredPhotos.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPhotos.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-gray-900/50 backdrop-blur-xl rounded-2xl overflow-hidden border border-gray-800 hover:border-gray-700 transition-all duration-300 hover:scale-105"
                >
                  <div className="relative aspect-square">
                    <Image
                      src={photo.imageData || photo.url}
                      alt={photo.description || "Group photo"}
                      fill
                      className="object-cover"
                    />
                    {/* Download button overlay */}
                    <div className="absolute top-2 right-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-8 w-8 rounded-full bg-black/50 hover:bg-black/70 border-0"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => downloadPhoto(photo, false)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download Compressed
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => downloadPhoto(photo, true)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download Original
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs bg-blue-600">
                          {(photo.user?.displayName || photo.userId)
                            .slice(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-300">
                        {photo.user?.displayName || photo.userId.slice(0, 8)}
                      </span>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-500">
                        {photo.uploadDate || new Date().toLocaleDateString()}
                      </span>
                    </div>
                    {photo.description && (
                      <p className="text-sm text-gray-300 mb-2 line-clamp-2">
                        {photo.description}
                      </p>
                    )}
                    {photo.location && (
                      <div className="flex items-center text-xs text-gray-400 mb-2">
                        <MapPin className="h-3 w-3 mr-1" />
                        {photo.location}
                      </div>
                    )}
                    {photo.tags && photo.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {photo.tags.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/20"
                          >
                            #{tag}
                          </Badge>
                        ))}
                        {photo.tags.length > 3 && (
                          <Badge
                            variant="secondary"
                            className="text-xs bg-gray-500/10 text-gray-400"
                          >
                            +{photo.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <div className="flex items-center space-x-4">
                        <button
                          className={`flex items-center space-x-1 transition-colors ${
                            photo.likes?.includes(user?.uid || "")
                              ? "text-red-400 hover:text-red-300"
                              : "hover:text-red-400"
                          }`}
                          onClick={() => handleLike(photo.id)}
                          disabled={!user}
                        >
                          <Heart
                            className={`h-4 w-4 ${
                              photo.likes?.includes(user?.uid || "")
                                ? "fill-current"
                                : ""
                            }`}
                          />
                          <span>{photo.likeCount || 0}</span>
                        </button>
                        <button
                          className="flex items-center space-x-1 hover:text-blue-400 transition-colors"
                          onClick={() => handleComment(photo)}
                        >
                          <MessageCircle className="h-4 w-4" />
                          <span>{photo.commentCount || 0}</span>
                        </button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs">
                          {Math.round(
                            (photo.compressedSize || photo.fileSize || 0) / 1024
                          )}
                          KB
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPhotos.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-gray-900/50 backdrop-blur-xl rounded-2xl overflow-hidden border border-gray-800 hover:border-gray-700 transition-all duration-300"
                >
                  <div className="flex">
                    <div className="relative w-48 h-48 flex-shrink-0">
                      <Image
                        src={photo.imageData || photo.url}
                        alt={photo.description || "Group photo"}
                        fill
                        className="object-cover"
                      />
                      {/* Download button overlay */}
                      <div className="absolute top-2 right-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="h-8 w-8 rounded-full bg-black/50 hover:bg-black/70 border-0"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => downloadPhoto(photo, false)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download Compressed
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => downloadPhoto(photo, true)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download Original
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className="flex-1 p-6">
                      <div className="flex items-center space-x-2 mb-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-sm bg-blue-600">
                            {(photo.user?.displayName || photo.userId)
                              .slice(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="text-sm font-medium text-gray-300">
                            {photo.user?.displayName ||
                              photo.userId.slice(0, 8)}
                          </span>
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="h-3 w-3 mr-1" />
                            {photo.uploadDate ||
                              new Date().toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      {photo.description && (
                        <p className="text-gray-300 mb-3">
                          {photo.description}
                        </p>
                      )}
                      {photo.location && (
                        <div className="flex items-center text-sm text-gray-400 mb-3">
                          <MapPin className="h-4 w-4 mr-1" />
                          {photo.location}
                        </div>
                      )}
                      {photo.tags && photo.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {photo.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="bg-blue-500/10 text-blue-400 border-blue-500/20"
                            >
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                          <button
                            className={`flex items-center space-x-2 transition-colors ${
                              photo.likes?.includes(user?.uid || "")
                                ? "text-red-400 hover:text-red-300"
                                : "hover:text-red-400"
                            }`}
                            onClick={() => handleLike(photo.id)}
                            disabled={!user}
                          >
                            <Heart
                              className={`h-5 w-5 ${
                                photo.likes?.includes(user?.uid || "")
                                  ? "fill-current"
                                  : ""
                              }`}
                            />
                            <span>{photo.likeCount || 0}</span>
                          </button>
                          <button
                            className="flex items-center space-x-2 hover:text-blue-400 transition-colors"
                            onClick={() => handleComment(photo)}
                          >
                            <MessageCircle className="h-5 w-5" />
                            <span>{photo.commentCount || 0}</span>
                          </button>
                        </div>
                        <div className="text-sm text-gray-400">
                          {Math.round(
                            (photo.compressedSize || photo.fileSize || 0) / 1024
                          )}
                          KB
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Empty State */}
      {!loading && !error && photos.length === 0 && (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <ImageIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            No photos yet
          </h3>
          <p className="text-gray-400 mb-6">
            Be the first to share a photo in this group!
          </p>
          <Button className="rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Camera className="h-4 w-4 mr-2" />
            Upload Photo
          </Button>
        </motion.div>
      )}

      {/* No Search Results */}
      {!loading &&
        !error &&
        photos.length > 0 &&
        filteredPhotos.length === 0 && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Search className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No photos found
            </h3>
            <p className="text-gray-400 mb-6">
              No photos match your search for "{searchTerm}"
            </p>
            <Button
              onClick={() => setSearchTerm("")}
              variant="outline"
              className="rounded-2xl border-gray-700 text-white hover:bg-gray-800"
            >
              Clear Search
            </Button>
          </motion.div>
        )}

      {/* Comments Modal */}
      <Dialog open={showComments} onOpenChange={setShowComments}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-gray-900 border-gray-700">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-white flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Comments
              </DialogTitle>
              {/* <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowComments(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button> */}
            </div>
          </DialogHeader>

          {selectedPhoto && (
            <div className="flex gap-6 h-[70vh]">
              {/* Left side - Photo */}
              <div className="flex-1 flex flex-col">
                <div className="flex-1 flex items-center justify-center bg-black rounded-lg overflow-hidden">
                  <div className="relative max-w-full max-h-full">
                    <Image
                      src={selectedPhoto.imageData || selectedPhoto.url}
                      alt={selectedPhoto.description || "Photo"}
                      width={600}
                      height={600}
                      className="object-contain max-w-full max-h-full"
                      style={{
                        maxHeight: "60vh",
                        width: "auto",
                        height: "auto",
                      }}
                    />
                  </div>
                </div>

                {/* Photo info below image */}
                <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-sm bg-blue-600 text-white">
                        {selectedPhoto.user?.displayName
                          ? selectedPhoto.user.displayName
                              .slice(0, 2)
                              .toUpperCase()
                          : selectedPhoto.userId.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <span className="text-sm font-medium text-white">
                        {selectedPhoto.user?.displayName ||
                          selectedPhoto.userId.slice(0, 8)}
                      </span>
                      <div className="text-xs text-gray-400">
                        {selectedPhoto.uploadDate ||
                          new Date().toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  {selectedPhoto.description && (
                    <p className="text-sm text-gray-300 mb-2">
                      {selectedPhoto.description}
                    </p>
                  )}
                  {selectedPhoto.location && (
                    <div className="flex items-center text-xs text-gray-400">
                      <MapPin className="h-3 w-3 mr-1" />
                      {selectedPhoto.location}
                    </div>
                  )}
                </div>
              </div>

              {/* Right side - Comments */}
              <div className="w-80 flex flex-col border-l border-gray-700 pl-6">
                <h4 className="font-medium text-white mb-4 flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Comments ({comments.length})
                </h4>

                {/* Comments list */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                  {loadingComments ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">
                        Loading comments...
                      </p>
                    </div>
                  ) : comments.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400 text-sm">
                        No comments yet. Be the first to comment!
                      </p>
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="flex items-start gap-3">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback className="text-xs bg-blue-600 text-white">
                            {comment.user?.displayName
                              ? comment.user.displayName
                                  .slice(0, 2)
                                  .toUpperCase()
                              : comment.userId.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="bg-gray-800 rounded-lg px-3 py-2">
                            <p className="font-medium text-sm text-white mb-1">
                              {comment.user?.displayName ||
                                comment.userId.slice(0, 8)}
                            </p>
                            <p className="text-sm text-gray-300 break-words">
                              {comment.text}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 ml-3">
                            {comment.createdAt?.toDate?.()?.toLocaleString() ||
                              "Just now"}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Add comment form */}
                {user ? (
                  <div className="border-t border-gray-700 pt-4">
                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback className="text-xs bg-blue-600 text-white">
                          {user.displayName
                            ? user.displayName.slice(0, 2).toUpperCase()
                            : user.uid.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 flex flex-col gap-2">
                        <Textarea
                          placeholder="Write a comment..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="flex-1 bg-gray-800 border-gray-600 text-white placeholder-gray-400 resize-none text-sm"
                          rows={3}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSubmitComment();
                            }
                          }}
                        />
                        <div className="flex justify-end">
                          <Button
                            onClick={handleSubmitComment}
                            disabled={!newComment.trim() || submittingComment}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            {submittingComment ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            ) : (
                              <>
                                <Send className="h-4 w-4 mr-1" />
                                Post
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border-t border-gray-700 pt-4">
                    <p className="text-center text-gray-400 text-sm">
                      Please sign in to add comments
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
