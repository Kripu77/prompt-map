import { useEffect, useState, RefObject } from 'react';
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

interface Position {
  x: number;
  y: number;
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

  // Load saved toolbar position on mount and check for first visit
  useEffect(() => {
    try {
      const savedPosition = localStorage.getItem(storageKey);
      
      if (savedPosition) {
        const parsedPosition = JSON.parse(savedPosition);
        
        // Validate saved position to make sure it's within viewport
        const validatedPosition = validatePosition(parsedPosition);
        setToolbarPosition(validatedPosition);
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
      console.error('Failed to load toolbar position:', e);
      // Fallback to default position
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
    if (!toolbarRef.current || !containerRef.current) return position;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const toolbarWidth = toolbarRef.current.offsetWidth || 200;
    const toolbarHeight = toolbarRef.current.offsetHeight || 100;
    
    // Ensure toolbar stays within container
    const validatedX = Math.max(0, Math.min(
      position.x,
      containerRect.width - toolbarWidth - 5
    ));
    
    const validatedY = Math.max(0, Math.min(
      position.y,
      containerRect.height - toolbarHeight - 5
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
              
              // Get updated position from drag location
              const nextX = Math.max(0, Math.min(
                event.location.current.input.clientX - containerRect.left - (isMobileViewport() ? 30 : 50), 
                containerRect.width - (toolbarRef.current.offsetWidth || 200)
              ));
              
              const nextY = Math.max(0, Math.min(
                event.location.current.input.clientY - containerRect.top - (isMobileViewport() ? 10 : 20), 
                containerRect.height - (toolbarRef.current.offsetHeight || 200)
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

  return {
    position: toolbarPosition,
    resetPosition,
    isFirstVisit
  };
}; 