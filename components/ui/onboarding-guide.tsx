"use client"

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, HelpCircle, Info, CornerDownLeft, Sparkles, ArrowRight } from 'lucide-react'
import { Button } from './button'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { cn } from '@/lib/utils'

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
    id: 'draggable-toolbar',
    title: 'Draggable Toolbar',
    description: 'This toolbar can be dragged anywhere on the screen for your convenience. Use it to zoom, center, enter fullscreen mode, or export your mindmap.',
    position: 'top',
    targetSelector: '.draggable-mindmap-toolbar',
    icon: <Info className="h-5 w-5" />,
  },
  {
    id: 'export-options',
    title: 'Export Your Mind Map',
    description: 'You can save your mind map as an image by clicking the export button in the toolbar.',
    position: 'top',
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
}

export function OnboardingGuide({ isFirstVisit = true }: OnboardingGuideProps) {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useLocalStorage('hasCompletedOnboarding', false)
  const [isGuideActive, setIsGuideActive] = useState(isFirstVisit && !hasCompletedOnboarding)
  const [currentStep, setCurrentStep] = useState(0)
  const [targetElement, setTargetElement] = useState<DOMRect | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState<'top' | 'bottom' | 'center'>('center')
  const [arrowLeftPosition, setArrowLeftPosition] = useState<string>('calc(50% - 6px)')
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)'
  })

  // Get the current step data
  const step = ONBOARDING_STEPS[currentStep]

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
    
    // Estimate tooltip dimensions (adjust these based on your actual tooltip sizes)
    const tooltipWidth = step.position === 'center' ? 320 : 280
    const tooltipHeight = 200
    
    // Calculate base positions
    let position: React.CSSProperties = {}
    let actualPosition: 'top' | 'bottom' = step.position === 'top' ? 'top' : 'bottom'
    
    // Calculate the target center position
    const targetCenterX = targetElement.left + (targetElement.width / 2)
    
    if (step.position === 'top') {
      // Position above the element
      const topPosition = targetElement.top - tooltipHeight - 15
      const leftPosition = targetCenterX
      
      // Check if the tooltip would go above the viewport
      if (topPosition < 20) {
        // Switch to bottom positioning
        actualPosition = 'bottom'
        position = {
          top: `${targetElement.bottom + 15}px`,
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
    } else {
      // Position below the element
      const topPosition = targetElement.bottom + 15
      const leftPosition = targetCenterX
      
      // Check if the tooltip would go below the viewport
      if (topPosition + tooltipHeight > viewportHeight - 20) {
        // Switch to top positioning
        actualPosition = 'top'
        position = {
          top: `${targetElement.top - tooltipHeight - 15}px`,
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
    }
    
    // Calculate arrow position
    let arrowPosition = 'calc(50% - 6px)' // Default center
    
    // Final horizontal boundary check
    const leftValue = parseInt(String(position.left), 10)
    if (isNaN(leftValue)) {
      // Fallback if parsing fails
      position.left = '50%'
      position.transform = 'translateX(-50%)'
    } else if (leftValue - (tooltipWidth / 2) < 20) {
      // Too close to left edge
      position.left = '20px'
      position.transform = 'none'
      
      // Calculate arrow position relative to repositioned tooltip
      const arrowLeftOffset = targetCenterX - 20
      arrowPosition = `${Math.max(15, Math.min(tooltipWidth - 15, arrowLeftOffset))}px`
    } else if (leftValue + (tooltipWidth / 2) > viewportWidth - 20) {
      // Too close to right edge
      position.left = `${viewportWidth - tooltipWidth - 20}px`
      position.transform = 'none'
      
      // Calculate arrow position relative to repositioned tooltip
      const tooltipLeft = viewportWidth - tooltipWidth - 20
      const arrowLeftOffset = targetCenterX - tooltipLeft
      arrowPosition = `${Math.max(15, Math.min(tooltipWidth - 15, arrowLeftOffset))}px`
    }
    
    setArrowLeftPosition(arrowPosition)
    setTooltipPosition(actualPosition)
    setTooltipStyle(position)
  }, [
    step.position, 
    targetElement, 
    // These state setters are stable and don't need to be in deps
    // setTooltipPosition, 
    // setTooltipStyle,
    // setArrowLeftPosition
  ]);

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
    setIsGuideActive(false)
    setHasCompletedOnboarding(true)
  }

  const restartOnboarding = () => {
    setCurrentStep(0)
    setIsGuideActive(true)
  }

  // If the user has already completed onboarding and it's not forced to show, return help button only
  if (!isGuideActive) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="icon"
          variant="secondary"
          className="h-10 w-10 rounded-full shadow-md"
          onClick={restartOnboarding}
        >
          <HelpCircle className="h-5 w-5" />
        </Button>
      </div>
    )
  }

  // Render the tooltip for the current step
  return (
    <>
      {/* Overlay to highlight the target element */}
      {step.targetSelector && targetElement && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40 pointer-events-none">
          <div 
            className="absolute bg-transparent border-2 border-primary rounded-lg animate-pulse-slow"
            style={{
              top: targetElement.top - 5,
              left: targetElement.left - 5,
              width: targetElement.width + 10,
              height: targetElement.height + 10
            }}
          />
        </div>
      )}
      
      {/* The tooltip */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={`tooltip-${step.id}`}
          className={cn(
            "fixed z-50 bg-card shadow-lg rounded-xl p-5 max-w-md w-full",
            "border border-border",
            step.position === 'center' ? "max-w-sm" : "max-w-xs"
          )}
          style={tooltipStyle}
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          transition={{ duration: 0.2 }}
        >
          {/* Tooltip Arrow */}
          {tooltipPosition !== 'center' && targetElement && (
            <div 
              className={cn(
                "absolute w-3 h-3 bg-card rotate-45 border",
                tooltipPosition === 'top' ? "bottom-[-6px] border-t-0 border-l-0" : "top-[-6px] border-b-0 border-r-0"
              )}
              style={{
                left: arrowLeftPosition,
                borderColor: 'var(--border)'
              }}
            />
          )}
          
          {/* Close button */}
          <Button
            className="absolute right-2 top-2 h-6 w-6"
            size="icon"
            variant="ghost"
            onClick={completeOnboarding}
          >
            <X className="h-4 w-4" />
          </Button>
          
          {/* Content */}
          <div className="flex items-start gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
              {step.icon}
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          </div>
          
          {/* Progress indicator */}
          <div className="flex items-center gap-1 mt-4 mb-1">
            {ONBOARDING_STEPS.map((_, index) => (
              <div 
                key={index} 
                className={cn(
                  "h-1 rounded-full flex-grow transition-colors duration-300",
                  index === currentStep ? "bg-primary" : "bg-muted"
                )}
              />
            ))}
          </div>
          
          {/* Navigation buttons */}
          <div className="flex justify-between mt-3">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={currentStep === 0 ? "invisible" : ""}
            >
              Back
            </Button>
            <Button 
              size="sm"
              onClick={handleNext}
            >
              {currentStep < ONBOARDING_STEPS.length - 1 ? "Next" : "Finish"}
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  )
} 