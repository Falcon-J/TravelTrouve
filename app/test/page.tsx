"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteAllGroups } from "@/lib/cleanup-utils";

export default function TestPage() {
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [cleanupResult, setCleanupResult] = useState<string>("");

  const handleCleanup = async () => {
    setIsCleaningUp(true);
    setCleanupResult("");

    try {
      await deleteAllGroups();
      setCleanupResult(
        "✅ All groups and photos have been successfully deleted!"
      );
    } catch (error) {
      setCleanupResult(
        `❌ Error during cleanup: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsCleaningUp(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 p-8">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Database Cleanup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-300">
              Click the button below to delete all groups and photos from the
              database. This action cannot be undone.
            </p>

            <Button
              onClick={handleCleanup}
              disabled={isCleaningUp}
              variant="destructive"
              className="w-full"
            >
              {isCleaningUp ? "Cleaning up..." : "Delete All Groups & Photos"}
            </Button>

            {cleanupResult && (
              <div className="p-4 bg-slate-800 rounded-lg">
                <p className="text-white">{cleanupResult}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
