"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload, ImageIcon, MapPin, Tag, X, Check, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { useAuth } from "@/context/auth-context";
import { uploadPhotoToGroup } from "@/lib/photo-utils";
import type { Group } from "@/types/group";

interface UploadPhotoSimpleProps {
  group: Group;
  onPhotoUploaded?: () => void;
}

interface UploadedFile extends File {
  preview: string;
  id: string;
}

export function UploadPhotoSimple({
  group,
  onPhotoUploaded,
}: UploadPhotoSimpleProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [tags, setTags] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!user) return;

      const newFiles = acceptedFiles.map((file) => {
        // Create a new object that includes the file properties plus our additions
        const uploadedFile = Object.assign(file, {
          preview: URL.createObjectURL(file),
          id: Math.random().toString(36).substring(7),
        }) as UploadedFile;

        return uploadedFile;
      });
      setUploadedFiles((prev) => [...prev, ...newFiles]);
    },
    [user]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    },
    multiple: true,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === fileId);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter((f) => f.id !== fileId);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (uploadedFiles.length === 0) {
      toast({
        title: "No photos selected",
        description: "Please select at least one photo to upload",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];

        // Create photo metadata
        const photoData = {
          description: caption.trim(),
          location: location.trim(),
          tags: tags
            ? tags
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean)
            : [],
        };

        // Use the original file directly (it's already a valid File object)
        // The UploadedFile interface extends File, so we can cast it back
        const originalFile = file as File;

        console.log("Uploading file:", {
          name: originalFile.name,
          type: originalFile.type,
          size: originalFile.size,
        });

        await uploadPhotoToGroup(group.id, user.uid, originalFile, photoData);
      }

      toast({
        title: "Photos uploaded successfully!",
        description: `${uploadedFiles.length} photo(s) have been added to ${group.name}`,
      });

      // Reset form
      setUploadedFiles([]);
      setCaption("");
      setLocation("");
      setTags("");
      setUploadProgress(0);

      // Call the callback to refresh the feed
      onPhotoUploaded?.();
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description:
          error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const suggestedTags = [
    "adventure",
    "sunset",
    "nature",
    "friends",
    "food",
    "architecture",
    "landscape",
  ];

  return (
    <div className="max-w-4xl mx-auto p-4">
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-semibold text-white mb-2">
          Upload Photos
        </h2>
        <p className="text-slate-400">Share your memories with {group.name}</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Upload Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Camera className="mr-2 h-5 w-5 text-blue-400" />
                Select Photos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                {...getRootProps()}
                className={`rounded-xl p-8 text-center cursor-pointer transition-all duration-300 border-2 border-dashed ${
                  isDragActive
                    ? "border-blue-500 bg-blue-500/10 scale-105"
                    : "border-slate-700 hover:border-slate-600 hover:bg-slate-800/50"
                }`}
              >
                <input {...getInputProps()} />
                <motion.div
                  animate={isDragActive ? { scale: 1.1 } : { scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Upload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                </motion.div>
                {isDragActive ? (
                  <div>
                    <p className="text-blue-400 font-semibold text-lg mb-2">
                      Drop the photos here!
                    </p>
                    <p className="text-blue-500/80">Release to upload</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-slate-300 font-semibold text-lg mb-2">
                      Drag & drop photos here, or click to select
                    </p>
                    <p className="text-slate-400 mb-4">
                      Supports JPG, PNG, GIF, WebP up to 5MB each
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-lg border-slate-700 text-slate-300 hover:bg-slate-800"
                    >
                      <ImageIcon className="mr-2 h-4 w-4" />
                      Choose Files
                    </Button>
                  </div>
                )}
              </div>

              {uploadedFiles.length > 0 && (
                <motion.div
                  className="mt-6"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-white flex items-center">
                      <Check className="mr-2 h-4 w-4 text-emerald-400" />
                      Selected Photos ({uploadedFiles.length})
                    </h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setUploadedFiles([])}
                      className="rounded-lg border-slate-700 text-slate-300 hover:bg-slate-800"
                    >
                      Clear All
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {uploadedFiles.map((file, index) => (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="relative group"
                      >
                        <div className="relative aspect-square rounded-lg overflow-hidden bg-slate-800">
                          <Image
                            src={file.preview || "/placeholder.svg"}
                            alt={`Upload ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-transparent group-hover:bg-slate-900/40 transition-colors duration-200" />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full h-6 w-6 p-0"
                            onClick={() => removeFile(file.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 truncate">
                          {file.name}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Photo Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl shadow-xl">
              <CardHeader>
                <CardTitle className="text-white">Photo Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <Label
                    htmlFor="caption"
                    className="text-sm font-medium text-slate-300"
                  >
                    Caption
                  </Label>
                  <Textarea
                    id="caption"
                    placeholder="Tell us about this moment..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="mt-2 rounded-lg bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-blue-500"
                    rows={4}
                  />
                </div>

                <div>
                  <Label
                    htmlFor="location"
                    className="flex items-center text-sm font-medium text-slate-300"
                  >
                    <MapPin className="mr-1 h-4 w-4 text-blue-400" />
                    Location
                  </Label>
                  <Input
                    id="location"
                    placeholder="Where was this taken?"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="mt-2 rounded-lg bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="tags"
                    className="flex items-center text-sm font-medium text-slate-300"
                  >
                    <Tag className="mr-1 h-4 w-4 text-emerald-400" />
                    Tags
                  </Label>
                  <Input
                    id="tags"
                    placeholder="adventure, sunset, nature..."
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="mt-2 rounded-lg bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-blue-500"
                  />
                  <div className="flex flex-wrap gap-2 mt-3">
                    <p className="text-xs text-slate-500 w-full">
                      Suggested tags:
                    </p>
                    {suggestedTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="cursor-pointer border-slate-700 text-slate-300 hover:bg-slate-800 rounded-full text-xs"
                        onClick={() => {
                          const currentTags = tags
                            .split(",")
                            .map((t) => t.trim())
                            .filter(Boolean);
                          if (!currentTags.includes(tag)) {
                            setTags((prev) => (prev ? `${prev}, ${tag}` : tag));
                          }
                        }}
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl shadow-xl">
              <CardHeader>
                <CardTitle className="text-white">Upload to Group</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">{group.name}</p>
                      <p className="text-sm text-slate-400">
                        {group.memberCount} member
                        {group.memberCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className="rounded-full bg-blue-500/10 text-blue-400 border-blue-500/20"
                    >
                      Member
                    </Badge>
                  </div>
                </div>

                {isUploading && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">
                        Uploading photos...
                      </span>
                      <span className="font-medium text-slate-300">
                        {uploadProgress}%
                      </span>
                    </div>
                    <Progress
                      value={uploadProgress}
                      className="h-1.5 bg-slate-800"
                    />
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-medium py-3 shadow-lg shadow-blue-500/20"
                  size="lg"
                  disabled={uploadedFiles.length === 0 || isUploading}
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload {uploadedFiles.length} Photo
                      {uploadedFiles.length !== 1 ? "s" : ""}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </form>
    </div>
  );
}
