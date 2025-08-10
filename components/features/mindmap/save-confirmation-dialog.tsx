"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Save, RefreshCw, FileText, AlertTriangle } from 'lucide-react';

interface SaveConfirmationDialogProps {
  isOpen: boolean;
  onSave: () => void;
  onDiscard: () => void;
  onCancel: () => void;
  isSaving?: boolean;
  isRefreshing?: boolean;
}

export function SaveConfirmationDialog({
  isOpen,
  onSave,
  onDiscard,
  onCancel,
  isSaving = false,
  isRefreshing = false
}: SaveConfirmationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={() => !isSaving && !isRefreshing && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">
                Save your changes?
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-600 mt-1">
                You have unsaved changes to your mind map content.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex items-start gap-3 p-4  rounded-lg border">
            <FileText className="h-5 w-5  mt-0.5" />
            <div>
              <p className="text-sm font-medium">
                What would you like to do?
              </p>
              <p className="text-xs mt-1">
                Save changes to your knowledge base or discard them and revert to the last saved version.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSaving || isRefreshing}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          
          <Button
            variant="outline"
            onClick={onDiscard}
            disabled={isSaving || isRefreshing}
            className="w-full sm:w-auto"
          >
            {isRefreshing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Discarding...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Discard Changes
              </>
            )}
          </Button>
          
          <Button
            onClick={onSave}
            disabled={isSaving || isRefreshing}
            className="w-full sm:w-auto bg-blue-600"
          >
            {isSaving ? (
              <>
                <Save className="h-4 w-4 mr-2 animate-pulse" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save to Knowledge Base
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}