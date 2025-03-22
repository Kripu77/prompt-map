"use client"

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, HelpCircle, Info, CornerDownLeft, Sparkles, ArrowRight } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/lib/utils'
import { useOnboardingState } from '@/hooks/use-onboarding-state'

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
    id: 'draggable-toolbar',
    title: 'Draggable Toolbar',
    description: 'This toolbar can be dragged anywhere on the screen for your convenience. It provides similar functionality with additional options.',
    position: 'bottom',
    targetSelector: '.draggable-mindmap-toolbar',
    icon: <Info className="h-5 w-5" />,
  },
  {
    id: 'topic-shift',
    title: 'Changing topics',
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
  // Use our new state management hook
  const {
    state: onboardingState,
    isLoading: isStateLoading,
    markStepCompleted,
    completeOnboarding: completeOnboardingState,
    restartOnboarding: restartOnboardingState
  } = useOnboardingState(userId)

  const [isGuideActive, setIsGuideActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [targetElement, setTargetElement] = useState<DOMRect | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState<'top' | 'bottom' | 'right' | 'left' | 'center'>('center')
  const [arrowLeftPosition, setArrowLeftPosition] = useState<string>('calc(50% - 6px)')
  const [arrowTopPosition, setArrowTopPosition] = useState<string>('calc(50% - 6px)')
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)'
  })
  const [isMobile, setIsMobile] = useState(false)

  // Get the current step data
  const step = ONBOARDING_STEPS[currentStep]

  // Initialize guide state based on onboarding data
  useEffect(() => {
    if (isStateLoading) return
    
    // Only show the guide if first visit and hasn't completed onboarding,
    // or if they've explicitly restarted
    const shouldShowGuide = 
      (isFirstVisit && !onboardingState.hasCompletedOnboarding) ||
      (onboardingState.hasCompletedOnboarding === false && 
       onboardingState.lastCompletedStep >= 0)
      
    setIsGuideActive(shouldShowGuide)
    
    // If they were in the middle of onboarding, restore their last position
    if (shouldShowGuide && onboardingState.lastCompletedStep >= 0) {
      setCurrentStep(Math.min(onboardingState.lastCompletedStep + 1, ONBOARDING_STEPS.length - 1))
    }
  }, [isStateLoading, isFirstVisit, onboardingState])

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

  // Calculate tooltip position and update states - memoized to prevent rerenders
  const calculateTooltipPosition = useCallback(() => {
    if (step.position === 'center' || !targetElement) {
      setTooltipPosition('center')
      setTooltipStyle({
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      })
      return;
    }

    // Get viewport dimensions
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    
    // Detect mobile screens
    const isSmallScreen = viewportWidth < 640 // sm breakpoint
    
    // Adjust tooltip dimensions based on screen size
    const tooltipWidth = isSmallScreen 
      ? (step.position === 'center' ? 300 : 280) // Increased width for mobile
      : (step.position === 'center' ? 400 : 350) // Increased width for desktop
    const tooltipHeight = isSmallScreen ? 220 : 240 // Slightly increased height
    
    // Use smaller margins on mobile
    const margin = isSmallScreen ? 15 : 25 // Increased margins for better visibility
    
    // Calculate base positions
    let position: React.CSSProperties = {}
    let actualPosition: 'top' | 'bottom' | 'right' | 'left' = step.position as 'top' | 'bottom' | 'right'
    
    // Calculate the target center position
    const targetCenterX = targetElement.left + (targetElement.width / 2)
    const targetCenterY = targetElement.top + (targetElement.height / 2)
    
    // Special case for toolbar which might be at the edge of the screen
    const isToolbarStep = step.id === 'draggable-toolbar' || step.id === 'mindmap-controls'
    
    // For smaller screens, use a simplified positioning approach
    if (isSmallScreen) {
      // On mobile, always position tooltip at the bottom of the viewport
      // with horizontal centering, but maintain enough space at the bottom
      const safeBottomMargin = 70 // Space for prompt input at bottom
      const topPosition = Math.min(
        viewportHeight - tooltipHeight - safeBottomMargin,
        Math.max(targetElement.bottom + margin, viewportHeight * 0.4)
      )
      
      // Center horizontally in viewport but with boundary checks
      position = {
        top: `${topPosition}px`,
        left: '50%',
        transform: 'translateX(-50%)'
      }
      
      // Always use bottom position for mobile
      actualPosition = 'bottom'
      
      // Calculate arrow position relative to horizontally centered tooltip
      const tooltipLeft = viewportWidth / 2 - tooltipWidth / 2
      const arrowLeftOffset = targetCenterX - tooltipLeft
      setArrowLeftPosition(`${Math.max(15, Math.min(tooltipWidth - 15, arrowLeftOffset))}px`)
      setArrowTopPosition('auto')
      
      // Store final position and style
      setTooltipPosition(actualPosition)
      setTooltipStyle(position)
      return;
    }
    
    // For toolbar elements, force bottom position with offset to ensure visibility
    if (isToolbarStep) {
      actualPosition = 'bottom'
      
      // Position the tooltip below the toolbar with more offset
      const topPosition = targetElement.bottom + margin + 5
      
      // Center horizontally but with boundary checks
      let leftPosition = targetCenterX - (tooltipWidth / 2)
      
      // Ensure the tooltip doesn't go off screen horizontally
      if (leftPosition < margin) {
        leftPosition = margin
      } else if (leftPosition + tooltipWidth > viewportWidth - margin) {
        leftPosition = viewportWidth - tooltipWidth - margin
      }
      
      position = {
        top: `${topPosition}px`,
        left: `${leftPosition}px`,
        transform: 'none'
      }
      
      // Calculate arrow position for bottom placement
      const arrowLeftOffset = targetCenterX - leftPosition
      setArrowLeftPosition(`${Math.max(15, Math.min(tooltipWidth - 15, arrowLeftOffset))}px`)
      setArrowTopPosition('auto')
      
      // Store final position and style
      setTooltipPosition(actualPosition)
      setTooltipStyle(position)
      return;
    }
    
    // Positioning logic based on desired position
    if (step.position === 'top') {
      // Position above the element
      const topPosition = targetElement.top - tooltipHeight - margin
      const leftPosition = targetCenterX
      
      // Check if the tooltip would go above the viewport
      if (topPosition < (isSmallScreen ? 15 : 25)) {
        // Switch to bottom positioning
        actualPosition = 'bottom'
        position = {
          top: `${targetElement.bottom + margin}px`,
          left: `${leftPosition}px`,
          transform: 'translateX(-50%)'
        }
      } else {
        position = {
          top: `${topPosition}px`,
          left: `${leftPosition}px`,
          transform: 'translateX(-50%)'
        }
      }
      
      setArrowLeftPosition('calc(50% - 6px)')
      setArrowTopPosition('auto') // Not used for top/bottom positioning
    } 
    else if (step.position === 'bottom') {
      // Position below the element
      const topPosition = targetElement.bottom + margin
      const leftPosition = targetCenterX
      
      // For elements close to bottom of screen, position above
      if (topPosition + tooltipHeight > viewportHeight - (isSmallScreen ? 25 : 35)) {
        // Switch to top positioning
        actualPosition = 'top'
        position = {
          top: `${targetElement.top - tooltipHeight - margin}px`,
          left: `${leftPosition}px`,
          transform: 'translateX(-50%)'
        }
      } else {
        position = {
          top: `${topPosition}px`,
          left: `${leftPosition}px`,
          transform: 'translateX(-50%)'
        }
      }
      
      setArrowLeftPosition('calc(50% - 6px)')
      setArrowTopPosition('auto') // Not used for top/bottom positioning
    }
    else if (step.position === 'right') {
      // Position to the right of the element
      const leftPosition = targetElement.right + margin
      const topPosition = targetCenterY - (tooltipHeight / 2)
      
      // Check if the tooltip would go off the right edge
      if (leftPosition + tooltipWidth > viewportWidth - (isSmallScreen ? 15 : 25)) {
        // If off right edge, try left side
        const leftSidePosition = targetElement.left - tooltipWidth - margin
        
        if (leftSidePosition > (isSmallScreen ? 15 : 25)) {
          // Left side has room
          position = {
            top: `${topPosition}px`,
            left: `${leftSidePosition}px`,
            transform: 'none'
          }
          actualPosition = 'left'
        } else {
          // Neither side works well, try top or bottom
          const topRoom = targetElement.top
          const bottomRoom = viewportHeight - targetElement.bottom
          
          if (topRoom > bottomRoom && topRoom > tooltipHeight + margin) {
            // Position above
            position = {
              top: `${targetElement.top - tooltipHeight - margin}px`,
              left: `${targetCenterX - (tooltipWidth / 2)}px`,
              transform: 'none'
            }
            actualPosition = 'top'
            setArrowLeftPosition('calc(50% - 6px)')
          } else {
            // Position below
            position = {
              top: `${targetElement.bottom + margin}px`,
              left: `${targetCenterX - (tooltipWidth / 2)}px`,
              transform: 'none'
            }
            actualPosition = 'bottom'
            setArrowLeftPosition('calc(50% - 6px)')
          }
        }
      } else {
        // Right side has room
        position = {
          top: `${topPosition}px`,
          left: `${leftPosition}px`,
          transform: 'none'
        }
      }
      
      // If we're using left/right positioning, calculate arrow vertical position
      if (actualPosition === 'right' || actualPosition === 'left') {
        // Position arrow vertically centered on the target
        const arrowTop = targetCenterY - parseInt(String(position.top), 10)
        setArrowTopPosition(`${Math.max(15, Math.min(tooltipHeight - 15, arrowTop))}px`)
        setArrowLeftPosition('auto') // Not used for left/right positioning
      }
    }
    
    // Additional horizontal boundary checks for top/bottom positioning
    if (actualPosition === 'top' || actualPosition === 'bottom') {
      const leftValue = parseInt(String(position.left), 10)
      if (isNaN(leftValue)) {
        // Fallback if parsing fails
        position.left = '50%'
        position.transform = 'translateX(-50%)'
      } else if (leftValue - (tooltipWidth / 2) < (isSmallScreen ? 15 : 25)) {
        // Too close to left edge
        position.left = isSmallScreen ? '15px' : '25px'
        position.transform = 'none'
        
        // Calculate arrow position relative to repositioned tooltip
        const arrowLeftOffset = targetCenterX - parseInt(String(position.left), 10)
        setArrowLeftPosition(`${Math.max(15, Math.min(tooltipWidth - 15, arrowLeftOffset))}px`)
      } else if (leftValue + (tooltipWidth / 2) > viewportWidth - (isSmallScreen ? 15 : 25)) {
        // Too close to right edge
        position.left = `${viewportWidth - tooltipWidth - (isSmallScreen ? 15 : 25)}px`
        position.transform = 'none'
        
        // Calculate arrow position relative to repositioned tooltip
        const tooltipLeft = viewportWidth - tooltipWidth - (isSmallScreen ? 15 : 25)
        const arrowLeftOffset = targetCenterX - tooltipLeft
        setArrowLeftPosition(`${Math.max(15, Math.min(tooltipWidth - 15, arrowLeftOffset))}px`)
      }
    }
    
    // Store final position and type
    setTooltipPosition(actualPosition)
    setTooltipStyle(position)
  }, [step.position, step.id, targetElement]);

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

  const handleNext = () => {
    // Mark the current step as completed
    if (step?.id) {
      markStepCompleted(step.id, currentStep)
    }
    
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      completeOnboarding()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const completeOnboarding = () => {
    // Update both local component state and persistent state
    setIsGuideActive(false)
    completeOnboardingState()
  }

  const restartOnboarding = () => {
    // Update both local component state and persistent state
    setCurrentStep(0)
    setIsGuideActive(true)
    restartOnboardingState()
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
      <AnimatePresence mode="wait">
        <motion.div 
          key={`tooltip-${step.id}`}
          className={cn(
            "fixed z-[100] bg-card/98 shadow-xl rounded-xl p-4 sm:p-5",
            "border border-primary/20 backdrop-blur-md",
            "shadow-[0_0_15px_rgba(0,0,0,0.1),0_0_3px_rgba(0,0,0,0.05)]",
            step.position === 'center' 
              ? "max-w-[95vw] sm:max-w-md md:max-w-lg mx-auto" 
              : "max-w-[95vw] sm:max-w-sm md:max-w-md"
          )}
          style={tooltipStyle}
          initial={{ opacity: 0, scale: 0.92, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 8 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
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
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-primary/15 text-primary p-1.5 sm:p-2 rounded-full">
                {step.icon}
              </div>
              <h3 className="font-semibold text-base sm:text-lg text-foreground">{step.title}</h3>
            </div>
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-7 w-7 rounded-full -mr-1 -mt-1 hover:bg-muted/80"
              onClick={completeOnboarding}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
          
          {/* Tooltip Content */}
          <p className="text-sm sm:text-base leading-relaxed text-foreground/80 mb-4 sm:mb-5">
            {step.description}
          </p>
          
          {/* Tooltip Controls */}
          <div className="flex items-center justify-between mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-border/40">
            <div className="flex gap-1.5">
              {ONBOARDING_STEPS.map((_, index) => (
                <div 
                  key={index} 
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    index === currentStep
                      ? "w-8 bg-primary" 
                      : onboardingState.completedSteps.includes(ONBOARDING_STEPS[index].id) 
                        ? "w-2.5 bg-primary/40 cursor-pointer hover:bg-primary/60"
                        : "w-2.5 bg-muted cursor-pointer hover:bg-primary/40"
                  )}
                  onClick={() => setCurrentStep(index)}
                />
              ))}
            </div>
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handlePrevious}
                  className="px-3 h-9"
                >
                  Previous
                </Button>
              )}
              <Button 
                size="sm" 
                onClick={handleNext}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 h-9"
              >
                {currentStep === ONBOARDING_STEPS.length - 1 ? "Finish" : "Next"}
              </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  )
} 