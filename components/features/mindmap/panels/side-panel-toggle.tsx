"use client";

import { useSidePanelStore } from '@/lib/stores/side-panel-store';
import { useReasoningPanelStore } from '@/lib/stores/reasoning-panel-store';
import { Button } from '@/components/ui/button';
import { PanelRightOpen, PanelRightClose } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidePanelToggleProps {
  className?: string;
}

export function SidePanelToggle({ className }: SidePanelToggleProps) {
  const { isOpen, toggle, width } = useSidePanelStore();
  const { setVisible: setReasoningPanelOpen } = useReasoningPanelStore();

  const handleToggle = () => {
    if (!isOpen) {
      // Close reasoning panel when opening side panel
      setReasoningPanelOpen(false);
    }
    toggle();
  };

  return (
    <Button
      onClick={handleToggle}
      variant="outline"
      size="sm"
      className={cn(
        "fixed  right-4 top-1/2 -translate-y-1/2 z-40 h-12 w-12 p-0 rounded-full shadow-lg border-2 bg-background/95 backdrop-blur-sm hover:bg-accent hover:text-accent-foreground transition-all duration-200",
        "hover:scale-105 active:scale-95",
        isOpen && `right-[calc(${width}vw+1rem)]`,
        className
      )}
      title={isOpen ? "Close notes panel" : "Open notes panel"}
    >
      {isOpen ? (
        <PanelRightClose className="h-5 w-5" />
      ) : (
        <PanelRightOpen className="h-5 w-5" />
      )}
    </Button>
  );
}