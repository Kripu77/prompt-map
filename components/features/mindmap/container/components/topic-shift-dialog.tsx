"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface TopicShiftDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  currentTopic: string;
  newTopic: string;
}

export function TopicShiftDialog({
  isOpen,
  onConfirm,
  onCancel,
  currentTopic,
  newTopic,
}: TopicShiftDialogProps) {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <DialogTitle>Topic Change Detected</DialogTitle>
          </div>
          <DialogDescription className="space-y-3 pt-2">
            <p>
              It looks like you're asking about a different topic. This will create a new mindmap.
            </p>
            <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-sm">
              <div>
                <span className="font-medium text-muted-foreground">Current:</span>
                <p className="text-foreground mt-1">{currentTopic}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">New:</span>
                <p className="text-foreground mt-1">{newTopic}</p>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onCancel}>
            Continue with current topic
          </Button>
          <Button onClick={onConfirm}>
            Start new mindmap
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}