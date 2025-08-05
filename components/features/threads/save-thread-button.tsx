"use client";

import { useState } from "react";
import { Button } from "../../ui/button";
import { Save, Loader2 } from "lucide-react";
import { useThreads } from "@/hooks/use-threads";
import { useMindmapStore } from "@/lib/stores/mindmap-store";
import { useReasoningPanelStore } from "@/lib/stores/reasoning-panel-store";

import { toast } from "sonner";
import { extractMindmapTitle } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../ui/dialog";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";

export function SaveThreadButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { createThread, isAuthenticated, fetchThreads } = useThreads();
  const { mindmapData, prompt } = useMindmapStore();
  const { reasoningContent } = useReasoningPanelStore();


  const handleSaveClick = () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to save threads");
      return;
    }

    // If no mindmap data, don't allow saving
    if (!mindmapData) {
      toast.error("No mind map data to save");
      return;
    }

    // Extract title from mindmap content if available
    const extractedTitle = extractMindmapTitle(mindmapData) || prompt;
    setTitle(extractedTitle);
    setIsOpen(true);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

 
    if (!mindmapData || !mindmapData.trim()) {
      toast.error("No mind map content to save");
      return;
    }

    try {
      setIsSaving(true);
      await createThread(title, mindmapData, reasoningContent || undefined);
      // Refresh the threads list to update the sidebar
      fetchThreads();
      setIsOpen(false);
      setTitle("");
    } catch (error) {
      console.error("Error saving thread:", error);
      toast.error("Failed to save thread");
    } finally {
      setIsSaving(false);
    }
  };

  if (!mindmapData) {
    return null;
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleSaveClick}
        className={cn(
          "flex items-center gap-1 px-2 sm:px-3 h-8 sm:h-9 rounded-full",
          "border-transparent bg-foreground/5 hover:bg-foreground/10",
          "hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
        )}
      >
        <Save className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        <span className="text-xs sm:text-sm font-medium">Save</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Save Mind Map</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a title for your mind map"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

