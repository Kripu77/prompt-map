"use client"

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, HelpCircle, Info, CornerDownLeft, Sparkles, ArrowRight, Download, List } from 'lucide-react'
import { Button } from '../../ui/button'
import { cn } from '@/lib/utils'

// Define the onboarding state interface
interface OnboardingState {
  hasCompletedOnboarding?: boolean;
  lastCompletedStep?: number;
  completedSteps?: string[];
  dismissedAt?: number;
  lastSeenAt?: number;
  onboardingVersion?: number;
  currentStep?: number;
  isCompleted?: boolean;
  lastUpdated?: string;
}

// Default state when a user is completely new
const defaultOnboardingState: OnboardingState = {
  hasCompletedOnboarding: false,
  lastCompletedStep: -1,
  completedSteps: [],
  onboardingVersion: 1,
};

// Define the different steps in the onboarding process
const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to PromptMap!',
    description: 'Generate beautiful, interactive mind maps powered by AI. Let me show you how to get started.',
    position: 'center',
    icon: <Sparkles className="h-5 w-5" />,
  },
  {
    id: 'prompt-input',
    title: 'Start with a prompt',
    description: 'Type a topic or question here to generate your first mind map. Try something like "Core concepts of Machine Learning" or "Project management best practices".',
    position: 'bottom',
    targetSelector: '.prompt-input-container',
    icon: <ArrowRight className="h-5 w-5" />,
  },
  {
    id: 'follow-up',
    title: 'Refine with follow-ups',
    description: 'After creating your first mind map, you can ask follow-up questions to expand specific areas or add more detail.',
    position: 'bottom',
    targetSelector: '.prompt-input-container',
    icon: <CornerDownLeft className="h-5 w-5" />,
  },
  {
    id: 'mindmap-controls',
    title: 'Interactive Controls',
    description: 'Use these controls to interact with your mindmap. You can zoom, center, enter fullscreen mode, and export your creation as an image.',
    position: 'bottom',
    targetSelector: '.mindmap-controls',
    icon: <Info className="h-5 w-5" />,
  },
  {
    id: 'export-option',
    title: 'Export Your Mindmap',
    description: 'After generating a mindmap, you can export it as an image to share or save for later reference.',
    position: 'bottom',
    targetSelector: '.header-export-button',
    icon: <Download className="h-5 w-5" />,
  },
  {
    id: 'saved-mindmaps',
    title: 'Access Your Mindmaps',
    description: 'When signed in, all your mindmaps are automatically saved. Click the sidebar icon to view, search, and load your previous work.',
    position: 'bottom-left',
    targetSelector: '.sidebar-toggle-button',
    icon: <List className="h-5 w-5" />,
  },
  {
    id: 'draggable-toolbar',
    title: 'Draggable Toolbar',
    description: 'This toolbar can be dragged anywhere on the screen for your convenience. It provides zoom, centering, and export functionality.',
    position: 'bottom-top',
    targetSelector: '.draggable-mindmap-toolbar',
    icon: <Info className="h-5 w-5" />,
  },
  {
    id: 'responsive-design',
    title: 'Optimized for All Devices',
    description: 'PromptMap works on both desktop and mobile. On smaller screens, use the compact menu and pinch gestures to zoom and navigate your mindmaps.',
    position: 'center',
    icon: <Info className="h-5 w-5" />,
  },
  {
    id: 'topic-shift',
    title: 'Changing Topics',
    description: 'If you ask about an unrelated topic, we\'ll detect it and give you the option to create a new mind map instead of modifying the current one.',
    position: 'bottom',
    targetSelector: '.prompt-input-container',
    icon: <Info className="h-5 w-5" />,
  },
  {
    id: 'complete',
    title: 'You\'re all set!',
    description: 'You now know the basics of using PromptMap. Explore and create amazing mind maps!',
    position: 'center',
    icon: <Sparkles className="h-5 w-5" />,
  }
]

interface OnboardingGuideProps {
  isFirstVisit?: boolean
  userId?: string // Can be passed when user authentication is implemented
}

export function OnboardingGuide({ isFirstVisit = true, userId }: OnboardingGuideProps) {
  // Local state
  const [onboardingState, setOnboardingState] = useState<OnboardingState>(defaultOnboardingState);
  const [isStateLoading, setIsStateLoading] = useState(true);
  const [isGuideActive, setIsGuideActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<DOMRect | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<'top' | 'bottom' | 'right' | 'left' | 'center'>('center');
  const [arrowLeftPosition, setArrowLeftPosition] = useState<string>('calc(50% - 6px)');
  const [arrowTopPosition, setArrowTopPosition] = useState<string>('calc(50% - 6px)');
  const tooltipStyle = {
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)'
  };
  const [isMobile, setIsMobile] = useState(false);

  // Get the current step data
  const step = ONBOARDING_STEPS[currentStep];
  
  // Load onboarding state from localStorage or database
  useEffect(() => {
    const loadOnboardingState = async () => {
      setIsStateLoading(true);
      
      try {
        if (userId) {
          // Signed-in user: load from database
          const response = await fetch('/api/user/onboarding');
          
          if (response.ok) {
            const data = await response.json();
            setOnboardingState(data);
          } else {
            // If API request fails, fall back to localStorage
            const localData = localStorage.getItem('onboarding-state');
            if (localData) {
              setOnboardingState(JSON.parse(localData));
            }
          }
        } else {
          // Non-signed-in user: load from localStorage
          const localData = localStorage.getItem('onboarding-state');
          if (localData) {
            setOnboardingState(JSON.parse(localData));
          }
        }
      } catch (error) {
        console.error('Failed to load onboarding state:', error);
      } finally {
        setIsStateLoading(false);
      }
    };
    
    loadOnboardingState();
  }, [userId]);
  
  // Persist onboarding state to localStorage or database
  const saveOnboardingState = useCallback(async (newState: OnboardingState) => {
    // Update local state immediately
    setOnboardingState(newState);
    
    try {
      if (userId) {
        // Signed-in user: save to database
        await fetch('/api/user/onboarding', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newState),
        });
      }
      
      // Always save to localStorage as fallback
      localStorage.setItem('onboarding-state', JSON.stringify(newState));
    } catch (error) {
      console.error('Failed to save onboarding state:', error);
    }
  }, [userId]);
  
  // Mark a step as completed
  const markStepCompleted = useCallback((stepId: string, stepIndex: number) => {
    const completedSteps = [...(onboardingState.completedSteps || [])];
    if (!completedSteps.includes(stepId)) {
      completedSteps.push(stepId);
    }
    
    const newState = {
      ...onboardingState,
      completedSteps,
      lastCompletedStep: Math.max(onboardingState.lastCompletedStep || -1, stepIndex),
      lastSeenAt: Date.now(),
    };
    
    saveOnboardingState(newState);
  }, [onboardingState, saveOnboardingState]);
  
  // Complete the onboarding process
  const completeOnboarding = useCallback(() => {
    const newState = {
      ...onboardingState,
      hasCompletedOnboarding: true,
      dismissedAt: Date.now(),
      lastSeenAt: Date.now(),
    };
    
    saveOnboardingState(newState);
    setIsGuideActive(false);
  }, [onboardingState, saveOnboardingState]);
  
  // Restart the onboarding process
  const restartOnboarding = useCallback(() => {
    const newState = {
      ...onboardingState,
      hasCompletedOnboarding: false,
      lastCompletedStep: -1,
      completedSteps: [],
      lastSeenAt: Date.now(),
    };
    
    saveOnboardingState(newState);
    setCurrentStep(0);
    setIsGuideActive(true);
  }, [onboardingState, saveOnboardingState]);

  // Initialize guide state based on loaded data
  useEffect(() => {
    if (isStateLoading) return;
    
    // Only show the guide if first visit and hasn't completed onboarding,
    // or if they've explicitly restarted
    const shouldShowGuide = 
      (isFirstVisit && !onboardingState.hasCompletedOnboarding) ||
      (onboardingState.hasCompletedOnboarding === false && 
       (onboardingState.lastCompletedStep || -1) >= 0);
    
    setIsGuideActive(shouldShowGuide);
    
    // If they were in the middle of onboarding, restore their last position
    if (shouldShowGuide && (onboardingState.lastCompletedStep || -1) >= 0) {
      setCurrentStep(Math.min((onboardingState.lastCompletedStep || -1) + 1, ONBOARDING_STEPS.length - 1));
    }
  }, [isStateLoading, isFirstVisit, onboardingState]);

  // Update isMobile state based on window size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }
    
    // Check initially
    checkMobile()
    
    // Set up listener for window resize
    window.addEventListener('resize', checkMobile)
    
    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  // Calculate tooltip position based on target element
  const calculateTooltipPosition = useCallback(() => {
    if (!targetElement) return { left: 0, top: 0 };
    
    // Use targetElement directly since it's already a DOMRect
    const rect = targetElement;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // Check if we're on a very small screen (mobile)
    const isVerySmallScreen = windowWidth < 480;
    // Check if we're on a small screen (mobile/tablet)
    const isSmallScreen = windowWidth < 640;
    
    // Base dimensions
    const tooltipWidth = isVerySmallScreen ? Math.min(windowWidth * 0.9, 280) : 
                      isSmallScreen ? Math.min(windowWidth * 0.8, 320) : 400;
    const tooltipHeight = isVerySmallScreen ? 180 : isSmallScreen ? 220 : 250;
    
    // For center position, we center the tooltip on the screen
    if (step.position === 'center') {
      return {
        left: (windowWidth - tooltipWidth) / 2,
        top: (windowHeight - tooltipHeight) / 2,
      };
    }
    
    // For special cases like mobile controls - center tooltip for better visibility
    if (isVerySmallScreen && step.targetSelector === '.mindmap-controls') {
      return {
        left: (windowWidth - tooltipWidth) / 2,
        top: windowHeight / 2 - tooltipHeight / 2, // Center vertically on small screens
      };
    }
    
    // For mobile sidebar buttons - center tooltip when on very small screens
    if (isVerySmallScreen && (step.targetSelector === '.sidebar-toggle-button' || step.targetSelector === '.header-export-button')) {
      return {
        left: (windowWidth - tooltipWidth) / 2,
        top: rect.bottom + 20,
      };
    }
    
    // For draggable toolbar, position based on screen size
    if (step.targetSelector === '.draggable-mindmap-toolbar') {
      if (isVerySmallScreen) {
        // Center the tooltip on very small screens
        return {
          left: (windowWidth - tooltipWidth) / 2,
          top: rect.bottom + 20,
        };
      }
      
      // Position above on larger screens
      return {
        left: (rect.left + rect.right) / 2 - tooltipWidth / 2,
        top: rect.top - tooltipHeight - 20,
      };
    }
    
    // Calculate based on specified position with fallbacks
    let position = step.position as 'top' | 'bottom' | 'right' | 'left' | 'center';
    
    // Default positioning logic (with small screen adjustments)
    let left: number | undefined, top: number | undefined;
    switch (position) {
      case 'top':
        left = (rect.left + rect.right) / 2 - tooltipWidth / 2;
        top = rect.top - tooltipHeight - 16;
        
        // Fallback if tooltip would be cut off at the top
        if (top < 10) {
          position = 'bottom';
          top = rect.bottom + 16;
        }
        break;
        
      case 'bottom':
        left = (rect.left + rect.right) / 2 - tooltipWidth / 2;
        top = rect.bottom + 16;
        
        // Fallback if tooltip would be cut off at the bottom
        if (top + tooltipHeight > windowHeight - 10) {
          position = 'top';
          top = rect.top - tooltipHeight - 16;
          
          // If still doesn't fit, try right or left
          if (top < 10) {
            if (rect.left > windowWidth / 2) {
              position = 'left';
              left = rect.left - tooltipWidth - 16;
              top = (rect.top + rect.bottom) / 2 - tooltipHeight / 2;
            } else {
              position = 'right';
              left = rect.right + 16;
              top = (rect.top + rect.bottom) / 2 - tooltipHeight / 2;
            }
          }
        }
        break;
        
      case 'left':
        left = rect.left - tooltipWidth - 16;
        top = (rect.top + rect.bottom) / 2 - tooltipHeight / 2;
        
        // Fallback if tooltip would be cut off at the left
        if (left < 10) {
          position = 'right';
          left = rect.right + 16;
        }
        break;
        
      case 'right':
        left = rect.right + 16;
        top = (rect.top + rect.bottom) / 2 - tooltipHeight / 2;
        
        // Fallback if tooltip would be cut off at the right
        if (left + tooltipWidth > windowWidth - 10) {
          position = 'left';
          left = rect.left - tooltipWidth - 16;
          
          // If still doesn't fit, try top or bottom
          if (left < 10) {
            if (rect.top > windowHeight / 2) {
              position = 'top';
              left = (rect.left + rect.right) / 2 - tooltipWidth / 2;
              top = rect.top - tooltipHeight - 16;
            } else {
              position = 'bottom';
              left = (rect.left + rect.right) / 2 - tooltipWidth / 2;
              top = rect.bottom + 16;
            }
          }
        }
        break;
    }
    
    // Final bounds checking to ensure tooltip is visible on screen
    if (left !== undefined) {
      if (left < 10) left = 10;
      if (left + tooltipWidth > windowWidth - 10) left = windowWidth - tooltipWidth - 10;
    }
    if (top !== undefined) {
      if (top < 10) top = 10;
      if (top + tooltipHeight > windowHeight - 10) top = windowHeight - tooltipHeight - 10;
    }
    
    // Update the position for the arrow
    setTooltipPosition(position);
    
    // Update arrow position
    if (left !== undefined && top !== undefined) {
      const arrowLeft = (rect.left + rect.right) / 2 - left;
      const arrowTop = (rect.top + rect.bottom) / 2 - top;
      setArrowLeftPosition(`${arrowLeft}px`);
      setArrowTopPosition(`${arrowTop}px`);
    }
    
    return { left, top };
  }, [targetElement, step.position, step.targetSelector]);

  // Update target element and position when step changes or on resize/scroll
  useEffect(() => {
    if (!isGuideActive) return

    const updateTooltipPosition = () => {
      if (step.targetSelector) {
        const element = document.querySelector(step.targetSelector)
        if (element) {
          setTargetElement(element.getBoundingClientRect())
        } else {
          setTargetElement(null)
        }
      } else {
        setTargetElement(null)
      }
    }

    // Initial position
    updateTooltipPosition()

    // Add event listeners for window resize and scroll
    window.addEventListener('resize', updateTooltipPosition)
    window.addEventListener('scroll', updateTooltipPosition)
    
    // Check for position updates periodically to handle dynamic content changes
    const intervalId = setInterval(updateTooltipPosition, 500)

    return () => {
      window.removeEventListener('resize', updateTooltipPosition)
      window.removeEventListener('scroll', updateTooltipPosition)
      clearInterval(intervalId)
    }
  }, [currentStep, isGuideActive, step.targetSelector])

  // Calculate tooltip position when target element updates
  useEffect(() => {
    if (targetElement || step.position === 'center') {
      calculateTooltipPosition();
    }
  }, [targetElement, step.position, calculateTooltipPosition]);

  // Function to remove duplicate tooltips - more aggressive approach
  useEffect(() => {
    if (!isGuideActive) return;

    // More aggressive function to remove ALL duplicate tooltips
    const cleanupTooltips = () => {
      // Get all tooltips by their common characteristics - look for both z-index and class patterns
      const allTooltips = document.querySelectorAll('[style*="z-index: 100"], [class*="onboarding-tooltip"]');
      
      if (allTooltips.length <= 1) return; // No duplicates to clean
      
      console.log(`Aggressive cleanup: Found ${allTooltips.length} tooltips, keeping only the current step tooltip`);
      
      // The one we want to keep is for the current step
      const currentStepTooltipId = `onboarding-tooltip-${currentStep}`;
      let hasFoundCurrentTooltip = false;
      
      allTooltips.forEach(tooltip => {
        if (tooltip.id === currentStepTooltipId) {
          hasFoundCurrentTooltip = true;
          console.log(`Keeping tooltip: ${tooltip.id}`);
        } else {
          console.log(`Removing tooltip: ${tooltip.id || 'unknown id'}`);
          if (tooltip.parentNode) {
            tooltip.parentNode.removeChild(tooltip);
          }
        }
      });
      
      // If we didn't find the current tooltip, the others might be leftovers from a previous session
      if (allTooltips.length > 0 && !hasFoundCurrentTooltip) {
        console.log('No current tooltip found, removing all tooltips');
        allTooltips.forEach(tooltip => {
          if (tooltip.parentNode) {
            tooltip.parentNode.removeChild(tooltip);
          }
        });
      }
    };
    
    // Call immediately on mount or step change
    cleanupTooltips();
    
    // Run cleanup on a more frequent interval
    const intervalId = setInterval(cleanupTooltips, 50);
    
    // Additional MutationObserver to catch new tooltips as they're added
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(() => {
        cleanupTooltips();
      });
    });
    
    // Observe the entire document for any new nodes
    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    });
    
    return () => {
      clearInterval(intervalId);
      observer.disconnect();
      
      // Final cleanup on dismount
      cleanupTooltips();
    };
  }, [currentStep, isGuideActive]);
  
  // Make sure we clean up all onboarding tooltips when the component unmounts
  useEffect(() => {
    return () => {
      const allTooltips = document.querySelectorAll('[style*="z-index: 100"], [class*="onboarding-tooltip"]');
      allTooltips.forEach(tooltip => {
        if (tooltip.parentNode) {
          tooltip.parentNode.removeChild(tooltip);
        }
      });
      console.log('Unmount cleanup: Removed all tooltips');
    };
  }, []);

  const handleNext = () => {
    // Mark the current step as completed
    if (step?.id) {
      markStepCompleted(step.id, currentStep);
    }
    
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      // Use setTimeout to avoid state update conflicts
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, 10);
    } else {
      completeOnboarding();
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      // Use setTimeout to avoid state update conflicts
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
      }, 10);
    }
  }

  // If loading state or user has completed onboarding and it's not forced to show, return help button only
  if (isStateLoading || !isGuideActive) {
    return (
      <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50">
        <Button
          size="icon"
          variant="secondary"
          className="h-9 w-9 sm:h-10 sm:w-10 rounded-full shadow-md"
          onClick={restartOnboarding}
        >
          <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </div>
    )
  }

  // Render the tooltip for the current step
  return (
    <>
      {/* Overlay to highlight the target element */}
      {step.targetSelector && targetElement && (
        <div className={cn(
          "fixed inset-0 z-40 pointer-events-none",
          {
            "bg-black/30 backdrop-blur-[1px]": !isMobile,
            "bg-black/15": isMobile // Less intrusive overlay on mobile
          }
        )}>
          {/* Highlight animation around the target element */}
          <div 
            className={cn(
              "absolute bg-transparent border-2 rounded-lg",
              {
                "border-primary animate-pulse-slow": !isMobile,
                "border-primary/70": isMobile // Subtler border on mobile
              }
            )}
            style={{
              top: targetElement.top - (isMobile ? 4 : 8),
              left: targetElement.left - (isMobile ? 4 : 8),
              width: targetElement.width + (isMobile ? 8 : 16),
              height: targetElement.height + (isMobile ? 8 : 16)
            }}
          />
          
          {/* Extra glow effect for better visibility */}
          {!isMobile && (
            <div 
              className="absolute bg-primary/5 rounded-lg shadow-lg shadow-primary/20"
              style={{
                top: targetElement.top - 2,
                left: targetElement.left - 2,
                width: targetElement.width + 4,
                height: targetElement.height + 4
              }}
            />
          )}
        </div>
      )}
      
      {/* The tooltip */}
      <AnimatePresence mode="wait" initial={false} onExitComplete={() => {
        // Additional cleanup after exit animation completes
        console.log('Exit animation complete, cleaning up again');
        const allTooltips = document.querySelectorAll('[class*="onboarding-tooltip"]');
        if (allTooltips.length > 1) {
          console.log(`Found ${allTooltips.length} tooltips after exit, cleaning up extras`);
          
          // Keep only the one for the current step
          const currentTooltipId = `onboarding-tooltip-${currentStep}`;
          allTooltips.forEach(tooltip => {
            if (tooltip.id !== currentTooltipId && tooltip.parentNode) {
              tooltip.parentNode.removeChild(tooltip);
            }
          });
        }
      }}>
        {isGuideActive && (
          <motion.div 
            key={`tooltip-step-${currentStep}`}
            id={`onboarding-tooltip-${currentStep}`}
            className={cn(
              "fixed z-[100] bg-card/98 shadow-xl rounded-xl p-4 sm:p-5",
              "border border-primary/20 backdrop-blur-md",
              "shadow-[0_0_15px_rgba(0,0,0,0.1),0_0_3px_rgba(0,0,0,0.05)]",
              "onboarding-tooltip",
              `onboarding-tooltip-step-${currentStep}`,
              step.position === 'center' 
                ? "max-w-[95vw] sm:max-w-md md:max-w-lg mx-auto" 
                : "max-w-[95vw] sm:max-w-sm md:max-w-md",
              "xs:p-4 p-3"
            )}
            style={tooltipStyle}
            initial={{ opacity: 0, scale: 0.92, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            data-onboarding-step={currentStep}
            data-tooltip-id={`tooltip-${currentStep}`}
          >
            {/* Tooltip Arrow - positioned dynamically based on tooltip position */}
            {tooltipPosition !== 'center' && targetElement && (
              <div 
                className={cn(
                  "absolute bg-card z-[-1] rotate-45 border shadow-sm",
                  {
                    "w-4 h-4": !isMobile,
                    "w-3 h-3": isMobile, // Smaller arrow on mobile
                    "bottom-[-7px] border-t-0 border-l-0 border-primary/20": tooltipPosition === 'top',
                    "top-[-7px] border-b-0 border-r-0 border-primary/20": tooltipPosition === 'bottom',
                    "left-[-7px] border-t-0 border-r-0 border-primary/20": tooltipPosition === 'right',
                    "right-[-7px] border-b-0 border-l-0 border-primary/20": tooltipPosition === 'left'
                  }
                )}
                style={{
                  left: (tooltipPosition === 'top' || tooltipPosition === 'bottom') ? arrowLeftPosition : undefined,
                  top: (tooltipPosition === 'right' || tooltipPosition === 'left') ? arrowTopPosition : undefined
                }}
              />
            )}
            
            {/* Tooltip Header */}
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="flex items-center gap-1.5 sm:gap-3">
                <div className="bg-primary/15 text-primary p-1.5 sm:p-2 rounded-full">
                  {step.icon}
                </div>
                <h3 className="font-semibold text-sm sm:text-base md:text-lg text-foreground">{step.title}</h3>
              </div>
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-6 w-6 sm:h-7 sm:w-7 rounded-full -mr-1 -mt-1 hover:bg-muted/80"
                onClick={completeOnboarding}
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
            
            {/* Tooltip Content */}
            <p className="text-xs sm:text-sm md:text-base leading-relaxed text-foreground/80 mb-3 sm:mb-4">
              {step.description}
            </p>
            
            {/* Tooltip Controls */}
            <div className="flex items-center justify-between mt-2 sm:mt-3 pt-2 border-t border-border/40">
              <div className="flex gap-1">
                {ONBOARDING_STEPS.map((_, index) => (
                  <div 
                    key={index} 
                    className={cn(
                      "h-1.5 sm:h-2 rounded-full transition-all duration-300",
                      index === currentStep
                        ? "w-6 sm:w-8 bg-primary" 
                        : onboardingState.completedSteps?.includes(ONBOARDING_STEPS[index].id) 
                          ? "w-2 sm:w-2.5 bg-primary/40 cursor-pointer hover:bg-primary/60"
                          : "w-2 sm:w-2.5 bg-muted cursor-pointer hover:bg-primary/40"
                    )}
                    onClick={() => setCurrentStep(index)}
                  />
                ))}
              </div>
              <div className="flex gap-1.5 sm:gap-2">
                {currentStep > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handlePrevious}
                    className="px-2 sm:px-3 h-7 sm:h-9 text-xs sm:text-sm"
                  >
                    Prev
                  </Button>
                )}
                <Button 
                  size="sm" 
                  onClick={handleNext}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 sm:px-4 h-7 sm:h-9 text-xs sm:text-sm"
                >
                  {currentStep === ONBOARDING_STEPS.length - 1 ? "Finish" : "Next"}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
} 