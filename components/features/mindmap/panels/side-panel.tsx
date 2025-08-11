"use client";

import React, { useState, useRef, useCallback } from 'react';
import { useSidePanelStore } from '@/lib/stores/side-panel-store';
import { useMindmapEditor } from '@/hooks/use-mindmap-editor';
import { RichTextEditor } from '../editors/rich-text-editor';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { X, FileText, Save } from 'lucide-react';



export function SidePanel() {
  const { isOpen, setIsOpen, width, setWidth } = useSidePanelStore();
  const { saveChanges, isSaving, canSave } = useMindmapEditor();
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  const handleSave = useCallback(async () => {
    await saveChanges();
  }, [saveChanges]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    e.preventDefault();
    
    const newWidth = ((window.innerWidth - e.clientX) / window.innerWidth) * 100;
    const clampedWidth = Math.min(Math.max(newWidth, 20), 80); // 20% to 80% of screen width
    setWidth(clampedWidth);
  }, [isResizing, setWidth]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  // Add event listeners for mouse move and up
  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent 
        side="right" 
        className="p-0 border-l overflow-hidden"
        style={{ 
          width: `${width}vw`,
          maxWidth: 'none',
          minWidth: '300px'
        }}
        hideCloseButton
      >
        {/* Resize Handle */}
        <div
          ref={resizeRef}
          className="absolute left-0 top-0 bottom-0 w-3 bg-transparent hover:bg-slate-200/30 cursor-col-resize z-50 group flex items-center justify-center"
          onMouseDown={handleMouseDown}
          style={{ left: '-1px' }}
        >
          <div className="w-1 h-12  transition-colors rounded-full opacity-60 group-hover:opacity-100"></div>
        </div>
        <SheetHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5" />
              <SheetTitle className="text-lg font-semibold">
                Notes
              </SheetTitle>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Save button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                disabled={!canSave || isSaving}
                className="h-8 px-3"
              >
                <Save className="h-4 w-4 mr-1" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
              
              {/* Close button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <SheetDescription className="text-sm text-left">
            Edit your mind map content in rich text format. Changes update the visualization in real-time. Click Save to persist changes to your knowledge base.
          </SheetDescription>
        </SheetHeader>
        
        <div className="flex-1 overflow-hidden flex flex-col">
          <RichTextEditor className="flex-1 h-full" />
        </div>
      </SheetContent>
    </Sheet>
  );
}