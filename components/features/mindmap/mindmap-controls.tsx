"use client"

import { Button } from '../../ui/button'
import { ZoomIn, ZoomOut, Maximize2, Download, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../ui/tooltip'

interface MindmapControlsProps {
  onZoomIn: () => void
  onZoomOut: () => void
  onFullscreen: () => void
  onExport: () => void
  onRefresh: () => void
  className?: string
}

export function MindmapControls({
  onZoomIn,
  onZoomOut,
  onFullscreen,
  onExport,
  onRefresh,
  className
}: MindmapControlsProps) {
  return (
    <motion.div 
      className={cn(
        "mindmap-controls fixed rounded-full bg-background/80 backdrop-blur-sm p-1 shadow-lg border border-border/30",
        "flex items-center gap-1",
        className
      )}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5, duration: 0.2 }}
    >
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={onZoomIn}
            >
              <ZoomIn className="h-4 w-4" />
              <span className="sr-only">Zoom In</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Zoom In</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={onZoomOut}
            >
              <ZoomOut className="h-4 w-4" />
              <span className="sr-only">Zoom Out</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Zoom Out</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={onFullscreen}
            >
              <Maximize2 className="h-4 w-4" />
              <span className="sr-only">Fullscreen</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Toggle Fullscreen</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={onExport}
            >
              <Download className="h-4 w-4" />
              <span className="sr-only">Export as Image</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Export as Image</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={onRefresh}
            >
              <RefreshCw className="h-4 w-4" />
              <span className="sr-only">Refresh Layout</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Refresh Layout</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </motion.div>
  )
} 