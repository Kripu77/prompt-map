import { useEffect, useState, RefObject } from 'react';
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

interface Position {
  x: number;
  y: number;
}

// Add a Size interface to track toolbar size
interface Size {
  width: number;
  height: number;
}

/**
 * Custom hook to make an element draggable within a container
 */
export const useDraggableToolbar = (
  toolbarRef: RefObject<HTMLDivElement | null>,
  containerRef: RefObject<HTMLDivElement | null>,
  initialPosition: Position = { x: 20, y: 20 },
  storageKey: string = 'mindmap-toolbar-position'
) => {
  const [toolbarPosition, setToolbarPosition] = useState<Position>(initialPosition);
  const [previousPosition, setPreviousPosition] = useState<Position | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isFirstVisit, setIsFirstVisit] = useState<boolean>(false);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [toolbarSize, setToolbarSize] = useState<Size>({
    width: 200,
    height: 150
  });
  
  // Helper to detect mobile viewport
  const isMobileViewport = () => {
    return typeof window !== 'undefined' && window.innerWidth < 640; // sm breakpoint
  };
  
  // Get optimal default position based on screen size
  const getDefaultPosition = (): Position => {
    if (isMobileViewport()) {
      // For mobile, position at bottom right by default
      return { x: 20, y: window.innerHeight - 120 };
    }
    // For larger screens, use the regular top left position
    return { x: 20, y: 20 };
  };

  // Load saved toolbar state (position AND size)
  useEffect(() => {
    try {
      const savedState = localStorage.getItem(storageKey);
      
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        
        // Load position
        if (parsedState.position) {
          const validatedPosition = validatePosition(parsedState.position);
          setToolbarPosition(validatedPosition);
        } else if (parsedState.x !== undefined) {
          // Handle legacy format where position was saved directly
          const validatedPosition = validatePosition(parsedState);
          setToolbarPosition(validatedPosition);
        } else {
          setToolbarPosition(getDefaultPosition());
        }
        
        // Load size if available
        if (parsedState.size) {
          setToolbarSize(parsedState.size);
        }
      } else {
        // If no saved position, use optimal default position
        setToolbarPosition(getDefaultPosition());
      }
      
      // Check if this is the first time the user has seen the draggable toolbar
      const hasSeenToolbarHint = localStorage.getItem('mindmap-toolbar-hint-shown');
      if (!hasSeenToolbarHint) {
        setIsFirstVisit(true);
        // Mark that the user has seen the hint
        localStorage.setItem('mindmap-toolbar-hint-shown', 'true');
        
        // Auto-hide the first-visit hint after 5 seconds, or 3 seconds on mobile
        setTimeout(() => {
          setIsFirstVisit(false);
        }, isMobileViewport() ? 3000 : 5000);
      }
    } catch (e) {
      console.error('Failed to load toolbar state:', e);
      // Fallback to defaults
      setToolbarPosition(getDefaultPosition());
    }
  }, [storageKey]);

  // Track fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const wasFullscreen = isFullscreen;
      const nowFullscreen = !!document.fullscreenElement;
      
      setIsFullscreen(nowFullscreen);
      
      // If exiting fullscreen, restore to previous position after a short delay
      if (wasFullscreen && !nowFullscreen && previousPosition && toolbarRef.current) {
        // Give the browser time to fully exit fullscreen and reflow
        setTimeout(() => {
          if (toolbarRef.current) {
            // Apply previous position
            setToolbarPosition(previousPosition);
            
            // Apply directly to the element for immediate visual update
            toolbarRef.current.style.left = `${previousPosition.x}px`;
            toolbarRef.current.style.top = `${previousPosition.y}px`;
            
            // Clear the previous position
            setPreviousPosition(null);
            
            // Save to localStorage
            try {
              localStorage.setItem(storageKey, JSON.stringify(previousPosition));
            } catch (e) {
              console.error('Failed to save toolbar position after exiting fullscreen:', e);
            }
          }
        }, 150);
      }
      
      // If entering fullscreen, store current position
      if (!wasFullscreen && nowFullscreen) {
        setPreviousPosition(toolbarPosition);
        
        // When entering fullscreen, reset position to a good default
        if (toolbarRef.current && containerRef.current) {
          // In fullscreen mode, position differently based on screen size
          const resetPosition = isMobileViewport()
            ? { x: 20, y: window.innerHeight - 120 } // Bottom left for mobile
            : { x: 20, y: 20 }; // Top left for desktop
            
          setToolbarPosition(resetPosition);
          
          // Apply directly for immediate visual update
          toolbarRef.current.style.left = `${resetPosition.x}px`;
          toolbarRef.current.style.top = `${resetPosition.y}px`;
        }
      }
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [isFullscreen, previousPosition, toolbarPosition, toolbarRef, containerRef, storageKey]);

  // Ensure the toolbar stays within viewport when screen resizes
  useEffect(() => {
    const handleResize = () => {
      if (toolbarRef.current && containerRef.current) {
        // Validate and adjust position if needed
        const validatedPosition = validatePosition(toolbarPosition);
        
        if (validatedPosition.x !== toolbarPosition.x || validatedPosition.y !== toolbarPosition.y) {
          setToolbarPosition(validatedPosition);
          
          // Apply directly for immediate visual update
          toolbarRef.current.style.left = `${validatedPosition.x}px`;
          toolbarRef.current.style.top = `${validatedPosition.y}px`;
          
          // Save to localStorage
          try {
            localStorage.setItem(storageKey, JSON.stringify(validatedPosition));
          } catch (e) {
            console.error('Failed to save adjusted toolbar position:', e);
          }
        }
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [toolbarPosition, toolbarRef, containerRef, storageKey]);

  // Helper to validate position is within viewport
  const validatePosition = (position: Position): Position => {
    if (!containerRef.current) return position;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const toolbarWidth = toolbarRef.current?.offsetWidth || 200;
    const toolbarHeight = toolbarRef.current?.offsetHeight || 100;
    
    // Ensure just a small part (10px) of toolbar remains visible
    // This allows the toolbar to be mostly outside the container while still being accessible
    const minVisiblePx = 10;
    
    // Calculate maximum values that would position the toolbar almost entirely outside
    const maxX = containerRect.width + toolbarWidth - minVisiblePx;
    const maxY = containerRect.height + toolbarHeight - minVisiblePx;
    
    // Much more permissive validation - allows positioning mostly outside the container
    const validatedX = Math.max(-toolbarWidth + minVisiblePx, Math.min(
      position.x,
      maxX
    ));
    
    const validatedY = Math.max(-toolbarHeight + minVisiblePx, Math.min(
      position.y,
      maxY
    ));
    
    return { x: validatedX, y: validatedY };
  };

  // Set up the draggable toolbar
  useEffect(() => {
    if (!toolbarRef.current || !containerRef.current) return;
    
    let dragCleanup: (() => void) | null = null;
    
    // The toolbar needs to be mounted in the DOM before we can make it draggable
    setTimeout(() => {
      if (toolbarRef.current) {
        // Apply the current position immediately
        const validatedPosition = validatePosition(toolbarPosition);
        toolbarRef.current.style.left = `${validatedPosition.x}px`;
        toolbarRef.current.style.top = `${validatedPosition.y}px`;
        
        // Apply size if it was saved
        if (toolbarSize.width) {
          toolbarRef.current.style.width = `${toolbarSize.width}px`;
        }
        if (toolbarSize.height) {
          toolbarRef.current.style.height = `${toolbarSize.height}px`;
        }
        
        // Update state if position was adjusted
        if (validatedPosition.x !== toolbarPosition.x || validatedPosition.y !== toolbarPosition.y) {
          setToolbarPosition(validatedPosition);
        }
        
        dragCleanup = draggable({
          element: toolbarRef.current,
          getInitialData: () => ({ 
            initialPosition: { ...toolbarPosition } 
          }),
          onDragStart: () => {
            if (toolbarRef.current) {
              toolbarRef.current.style.cursor = 'grabbing';
              toolbarRef.current.style.opacity = '0.8';
              
              // When user starts dragging, they've clearly understood it's draggable
              setIsFirstVisit(false);
            }
          },
          onDrag: (event) => {
            if (toolbarRef.current && containerRef.current) {
              const containerRect = containerRef.current.getBoundingClientRect();
              const toolbarWidth = toolbarRef.current.offsetWidth || 200;
              const toolbarHeight = toolbarRef.current.offsetHeight || 100;
              
              // Minimum visible portion - just 10px to keep it accessible
              const minVisiblePx = 10;
              
              // Calculate maximum values for positioning mostly outside
              const maxX = containerRect.width + toolbarWidth - minVisiblePx;
              const maxY = containerRect.height + toolbarHeight - minVisiblePx;
              
              // Get updated position from drag location - allow almost full overflow
              const nextX = Math.max(-toolbarWidth + minVisiblePx, Math.min(
                event.location.current.input.clientX - containerRect.left - (isMobileViewport() ? 30 : 50), 
                maxX
              ));
              
              const nextY = Math.max(-toolbarHeight + minVisiblePx, Math.min(
                event.location.current.input.clientY - containerRect.top - (isMobileViewport() ? 10 : 20), 
                maxY
              ));
              
              // Update position
              setToolbarPosition({ x: nextX, y: nextY });
              
              // Apply position directly for smooth dragging
              toolbarRef.current.style.left = `${nextX}px`;
              toolbarRef.current.style.top = `${nextY}px`;
            }
          },
          onDrop: () => {
            if (toolbarRef.current) {
              toolbarRef.current.style.cursor = 'grab';
              toolbarRef.current.style.opacity = '1';
              
              // Save position to localStorage for persistence
              try {
                localStorage.setItem(storageKey, JSON.stringify(toolbarPosition));
              } catch (e) {
                console.error('Failed to save toolbar position:', e);
              }
            }
          }
        });
      }
    }, 100);
    
    // Clean up the draggable functionality when unmounting
    return () => {
      if (dragCleanup) {
        dragCleanup();
      }
    };
  }, [containerRef, toolbarRef, toolbarPosition, storageKey]);

  const resetPosition = () => {
    const defaultPosition = getDefaultPosition();
    
    // Update state
    setToolbarPosition(defaultPosition);
    
    // Apply directly to the element for immediate visual feedback
    if (toolbarRef.current) {
      toolbarRef.current.style.left = `${defaultPosition.x}px`;
      toolbarRef.current.style.top = `${defaultPosition.y}px`;
    }
    
    // Save to localStorage
    try {
      localStorage.setItem(storageKey, JSON.stringify(defaultPosition));
    } catch (e) {
      console.error('Failed to save reset toolbar position:', e);
    }
  };

  const handleResizeStart = () => {
    setIsResizing(true);
    
    const handleResizeMove = (e: MouseEvent) => {
      if (isResizing && toolbarRef.current && containerRef.current) {
        e.preventDefault();
        
        const containerRect = containerRef.current.getBoundingClientRect();
        const toolbarRect = toolbarRef.current.getBoundingClientRect();
        
        // Calculate new size based on mouse position
        const newWidth = Math.max(150, Math.min(
          e.clientX - toolbarRect.left,
          containerRect.width * 0.9
        ));
        
        const newHeight = Math.max(80, Math.min(
          e.clientY - toolbarRect.top,
          containerRect.height * 0.9
        ));
        
        // Apply size directly for smooth resizing
        toolbarRef.current.style.width = `${newWidth}px`;
        toolbarRef.current.style.height = `${newHeight}px`;
      }
    };
    
    const handleResizeTouchMove = (e: TouchEvent) => {
      if (isResizing && toolbarRef.current && containerRef.current && e.touches.length > 0) {
        e.preventDefault();
        
        const touch = e.touches[0];
        const containerRect = containerRef.current.getBoundingClientRect();
        const toolbarRect = toolbarRef.current.getBoundingClientRect();
        
        // Calculate new size based on touch position
        const newWidth = Math.max(150, Math.min(
          touch.clientX - toolbarRect.left,
          containerRect.width * 0.9
        ));
        
        const newHeight = Math.max(80, Math.min(
          touch.clientY - toolbarRect.top,
          containerRect.height * 0.9
        ));
        
        // Apply size directly for smooth resizing
        toolbarRef.current.style.width = `${newWidth}px`;
        toolbarRef.current.style.height = `${newHeight}px`;
      }
    };
    
    const handleResizeEnd = () => {
      setIsResizing(false);
      
      // Get current size from DOM
      if (toolbarRef.current) {
        const newSize = {
          width: toolbarRef.current.offsetWidth,
          height: toolbarRef.current.offsetHeight
        };
        
        // Update state
        setToolbarSize(newSize);
        
        // Save to localStorage, including both position and size
        try {
          localStorage.setItem(storageKey, JSON.stringify({
            position: toolbarPosition,
            size: newSize
          }));
        } catch (e) {
          console.error('Failed to save toolbar state:', e);
        }
      }
      
      // Remove event listeners
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
      document.removeEventListener('touchmove', handleResizeTouchMove);
      document.removeEventListener('touchend', handleResizeEnd);
    };
    
    // Add event listeners
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
    document.addEventListener('touchmove', handleResizeTouchMove, { passive: false });
    document.addEventListener('touchend', handleResizeEnd);
  };

  return {
    position: toolbarPosition,
    resetPosition,
    isFirstVisit,
    handleResizeStart
  };
}; 