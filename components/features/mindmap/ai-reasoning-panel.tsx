"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import { motion, animate } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Brain, X, Search, ExternalLink, Globe, Lightbulb, Target, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface ToolCall {
  id: string
  name: string
  args: Record<string, unknown>
}

interface ToolResult {
  id: string
  result: Record<string, unknown>
}

interface ParsedReasoningContent {
  text: string
  toolCalls: ToolCall[]
  toolResults: ToolResult[]
}

interface ReasoningStep {
  id: string
  type: "thought" | "analysis" | "decision" | "action"
  content: string
  timestamp?: number
}

function parseReasoningIntoSteps(content: string): ReasoningStep[] {
  if (!content) return []

  const steps: ReasoningStep[] = []
  const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 10)

  sentences.forEach((sentence, index) => {
    const trimmed = sentence.trim()
    if (!trimmed) return

    let type: ReasoningStep["type"] = "thought"

    if (
      trimmed.toLowerCase().includes("need to") ||
      trimmed.toLowerCase().includes("should") ||
      trimmed.toLowerCase().includes("must")
    ) {
      type = "decision"
    } else if (
      trimmed.toLowerCase().includes("analyzing") ||
      trimmed.toLowerCase().includes("looking at") ||
      trimmed.toLowerCase().includes("considering")
    ) {
      type = "analysis"
    } else if (
      trimmed.toLowerCase().includes("creating") ||
      trimmed.toLowerCase().includes("building") ||
      trimmed.toLowerCase().includes("generating")
    ) {
      type = "action"
    }

    steps.push({
      id: `step-${index}`,
      type,
      content: trimmed,
      timestamp: Date.now() + index * 100,
    })
  })

  return steps
}

function ReasoningStepCard({
  step,
  index,
}: {
  step: ReasoningStep
  index: number
}) {
  const getStepIcon = (type: ReasoningStep["type"]) => {
    switch (type) {
      case "thought":
        return <Lightbulb className="h-4 w-4" />
      case "analysis":
        return <Search className="h-4 w-4" />
      case "decision":
        return <Target className="h-4 w-4" />
      case "action":
        return <Zap className="h-4 w-4" />
      default:
        return <Brain className="h-4 w-4" />
    }
  }

  const getStepColor = (type: ReasoningStep["type"]) => {
    switch (type) {
      case "thought":
        return "text-primary bg-primary/5 border-primary/20"
      case "analysis":
        return "text-primary bg-primary/5 border-primary/20"
      case "decision":
        return "text-primary bg-primary/5 border-primary/20"
      case "action":
        return "text-primary bg-primary/5 border-primary/20"
      default:
        return "text-muted-foreground bg-muted/30 border-border/40"
    }
  }

  const getStepLabel = (type: ReasoningStep["type"]) => {
    switch (type) {
      case "thought":
        return "Thinking"
      case "analysis":
        return "Analyzing"
      case "decision":
        return "Deciding"
      case "action":
        return "Acting"
      default:
        return "Processing"
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0.8, y: 2 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className={cn(
        "rounded-lg border transition-all duration-200 hover:shadow-sm",
        "p-2 md:p-4",
        getStepColor(step.type)
      )}
    >
      <div className="flex items-start gap-2 md:gap-3">
        <div
          className={cn(
            "flex-shrink-0 rounded-full flex items-center justify-center",
            "w-6 h-6 md:w-8 md:h-8",
            step.type === "thought" && "bg-primary/10",
            step.type === "analysis" && "bg-primary/10",
            step.type === "decision" && "bg-primary/10",
            step.type === "action" && "bg-primary/10",
            !["thought", "analysis", "decision", "action"].includes(step.type) && "bg-muted/50",
          )}
        >
          <div className="w-3 h-3 md:w-4 md:h-4">
            {getStepIcon(step.type)}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 md:mb-2">
            <span className="text-xs font-semibold uppercase tracking-wide">{getStepLabel(step.type)}</span>
            <span className="text-xs text-muted-foreground hidden sm:inline">Step {index + 1}</span>
          </div>
          <p className="text-xs md:text-sm leading-relaxed text-foreground">{step.content}</p>
        </div>
      </div>
    </motion.div>
  )
}

function parseReasoningContent(content: string): ParsedReasoningContent {
  const lines = content.split("\n")
  const toolCalls: ToolCall[] = []
  const toolResults: ToolResult[] = []
  let cleanText = ""

  for (const line of lines) {
    const toolCallMatch = line.match(/^\d+:\{"toolCallId":"([^"]+)","toolName":"([^"]+)","args":(.+)\}$/)
    if (toolCallMatch) {
      try {
        const args = JSON.parse(toolCallMatch[3])
        toolCalls.push({
          id: toolCallMatch[1],
          name: toolCallMatch[2],
          args,
        })
      } catch {
        cleanText += line + "\n"
      }
      continue
    }

    const toolResultMatch = line.match(/^a:\{"toolCallId":"([^"]+)","result":(.+)\}$/)
    if (toolResultMatch) {
      try {
        const result = JSON.parse(toolResultMatch[2])
        toolResults.push({
          id: toolResultMatch[1],
          result,
        })
      } catch {
        cleanText += line + "\n"
      }
      continue
    }

    if (line.startsWith("g:")) {
      continue
    }

    if (line.trim()) {
      cleanText += line + "\n"
    }
  }

  return {
    text: cleanText.trim(),
    toolCalls,
    toolResults,
  }
}

function WebSearchResults({ results }: { results: Record<string, unknown> }) {
  if (!results || !results.results) return null

  const extractWebResults = (resultsData: unknown) => {
    if (Array.isArray(resultsData)) {
      return resultsData.slice(0, 3)
    }
    if (typeof resultsData === "string") {
      const urlRegex = /`(https?:\/\/[^\s`]+)`/g
      const urls = []
      let match
      while ((match = urlRegex.exec(resultsData)) !== null) {
        urls.push(match[1])
      }
      return urls.slice(0, 3).map((url, index) => ({
        url,
        title: `Search Result ${index + 1}`,
        content: `Found relevant information at ${url}`,
      }))
    }
    return []
  }

  const webResults = extractWebResults(results.results)
  if (webResults.length === 0) return null

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
        <Globe className="h-3 w-3" />
        Web Search Results
      </div>
      {webResults.map((result, index) => (
        <div key={index} className="bg-muted/30 rounded-md p-3 border border-border/40">
          <div className="flex items-start gap-2">
            <ExternalLink className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-foreground truncate">{result.title || "Web Result"}</div>
              {result.url && (
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:text-primary/80 hover:underline truncate block"
                >
                  {result.url}
                </a>
              )}
              {result.content && (
                <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {result.content.substring(0, 100)}...
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function ToolCallDisplay({ toolCall, result }: { toolCall: ToolCall; result?: ToolResult }) {
  const isWebSearch = toolCall.name === "search.web"

  return (
    <div className="bg-primary/5 rounded-lg border border-primary/20 mb-2 md:mb-3 p-2 md:p-4">
      <div className="flex items-center gap-2 mb-2 md:mb-3">
        <Search className="h-3 w-3 md:h-4 md:w-4 text-primary flex-shrink-0" />
        <span className="text-xs md:text-sm font-medium text-primary truncate">
          {isWebSearch ? "Web Search" : toolCall.name}
        </span>
      </div>
      {toolCall.args && typeof toolCall.args === "object" && toolCall.args !== null && "query" in toolCall.args && (
        <div className="text-xs md:text-sm text-muted-foreground mb-2 md:mb-3">
          <span className="font-medium">Query:</span> <span className="break-words">{String(toolCall.args.query)}</span>
        </div>
      )}
      {result && isWebSearch && <WebSearchResults results={result.result} />}
      {result && !isWebSearch && (
        <div className="text-xs md:text-sm text-muted-foreground">
          <span className="font-medium">Result:</span> 
          <div className="mt-1 p-2 bg-muted/30 rounded text-xs overflow-x-auto">
            <pre className="whitespace-pre-wrap break-all">
              {JSON.stringify(result.result).substring(0, 150)}...
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}

interface AIReasoningPanelProps {
  reasoningContent?: string
  isStreaming: boolean
  isVisible: boolean
  onToggleVisibility: () => void
  topic?: string
  className?: string
}

export function AIReasoningPanel({
  reasoningContent,
  isStreaming,
  onToggleVisibility,
  className,
  topic,
}: AIReasoningPanelProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const scrollAnimationRef = useRef<{ stop?: () => void } | null>(null)
  const lastContentLength = useRef(0)
  const isUserScrollingRef = useRef(false)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const throttleTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1280)

  // Modern smooth scroll implementation optimized for streaming content
  const smoothScrollToBottom = useCallback(() => {
    if (!scrollAreaRef.current || isUserScrollingRef.current) return

    const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]") as HTMLElement
    if (!scrollContainer) return

    const { scrollHeight, clientHeight, scrollTop } = scrollContainer
    const maxScrollTop = scrollHeight - clientHeight

    // Only scroll if there's content to scroll and we're not already near the bottom
    if (maxScrollTop <= 0 || scrollTop >= maxScrollTop - 5) return

    // Stop any existing scroll animation
    if (scrollAnimationRef.current?.stop) {
      scrollAnimationRef.current.stop()
    }

    const distance = maxScrollTop - scrollTop
    
    // For streaming content, use shorter, more frequent animations
    // This creates a smooth "following" effect as content appears
    const duration = isStreaming 
      ? Math.min(0.6, Math.max(0.3, distance / 400)) // Faster for streaming (0.3-0.6s)
      : Math.min(1.2, Math.max(0.5, distance / 300)) // Slower for static content (0.5-1.2s)

    // Create smooth scroll animation with optimized easing for streaming
    const animation = animate(scrollTop, maxScrollTop, {
      duration,
      ease: isStreaming 
        ? [0.25, 0.46, 0.45, 0.94] // Smoother easing for streaming content
        : [0.08, 0.82, 0.17, 1],   // More dramatic easing for static content
      onUpdate: (value) => {
        if (scrollContainer && !isUserScrollingRef.current) {
          scrollContainer.scrollTop = value
        }
      },
      onComplete: () => {
        scrollAnimationRef.current = null
      },
    })

    scrollAnimationRef.current = { stop: animation.stop }
  }, [isStreaming])

  // Throttled scroll trigger optimized for streaming performance
  const throttledScrollTrigger = useCallback(() => {
    // Clear existing throttle timeout
    if (throttleTimeoutRef.current) {
      clearTimeout(throttleTimeoutRef.current)
    }

    // Use more aggressive throttling for streaming content
    const throttleDelay = isStreaming ? 50 : 200 // Much more frequent updates during streaming

    throttleTimeoutRef.current = setTimeout(() => {
      if (!isUserScrollingRef.current) {
        requestAnimationFrame(() => {
          smoothScrollToBottom()
        })
      }
    }, throttleDelay)
  }, [smoothScrollToBottom, isStreaming])

  // Immediate scroll trigger for streaming (no throttling)
  const immediateScrollTrigger = useCallback(() => {
    if (!isUserScrollingRef.current) {
      requestAnimationFrame(() => {
        smoothScrollToBottom()
      })
    }
  }, [smoothScrollToBottom])

  // Detect user scrolling to pause auto-scroll
  useEffect(() => {
    const scrollContainer = scrollAreaRef.current?.querySelector("[data-radix-scroll-area-viewport]") as HTMLElement
    if (!scrollContainer) return

    let isScrolling = false

    const handleScroll = () => {
      if (!isScrolling) {
        isUserScrollingRef.current = true
        
        // Stop any ongoing animation when user scrolls
        if (scrollAnimationRef.current?.stop) {
          scrollAnimationRef.current.stop()
        }
      }
      
      isScrolling = true
      
      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
      
      // Resume auto-scroll after user stops scrolling
      scrollTimeoutRef.current = setTimeout(() => {
        isScrolling = false
        isUserScrollingRef.current = false
        
        // Resume auto-scroll if we're streaming and not at bottom
        if (isStreaming) {
          throttledScrollTrigger()
        }
      }, 1000) // Wait 1 second after user stops scrolling
    }

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [isStreaming, throttledScrollTrigger])

  // Enhanced content change detection for streaming
  useEffect(() => {
    if (!reasoningContent) {
      lastContentLength.current = 0
      return
    }

    const currentLength = reasoningContent.length
    
    // Always trigger scroll when content changes during streaming
    if (isStreaming) {
      // For streaming, scroll on every content change regardless of size
      if (currentLength !== lastContentLength.current) {
        lastContentLength.current = currentLength
        // Use immediate scroll for streaming content
        immediateScrollTrigger()
      }
    } else {
      // For static content, only scroll if content actually grew
      if (currentLength > lastContentLength.current) {
        lastContentLength.current = currentLength
        setTimeout(throttledScrollTrigger, 100)
      }
    }
  }, [reasoningContent, isStreaming, throttledScrollTrigger, immediateScrollTrigger])

  // Additional effect specifically for streaming content updates
  useEffect(() => {
    if (isStreaming && reasoningContent) {
      // Force immediate scroll trigger during streaming
      immediateScrollTrigger()
    }
  }, [reasoningContent, isStreaming, immediateScrollTrigger])

  // Handle streaming state changes
  useEffect(() => {
    if (isStreaming) {
      // Reset user scrolling state when streaming starts
      isUserScrollingRef.current = false
      // Trigger immediate initial scroll
      immediateScrollTrigger()
    }
  }, [isStreaming, immediateScrollTrigger])

  // Handle window resize for responsive positioning
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scrollAnimationRef.current?.stop) {
        scrollAnimationRef.current.stop()
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current)
      }
    }
  }, [])

  const reasoningSteps = parseReasoningIntoSteps(reasoningContent || "")
  const parsed = parseReasoningContent(reasoningContent || "")

  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        y: 20,
        scale: 0.95
      }}
      animate={{ 
        opacity: 1, 
        y: 0,
        scale: 1
      }}
      exit={{ 
        opacity: 0, 
        y: 20,
        scale: 0.95
      }}
      transition={{ 
        duration: 0.3, 
        ease: [0.16, 1, 0.3, 1],
        type: "spring",
        damping: 25,
        stiffness: 300
      }}
      style={{
        position: 'fixed',
        zIndex: 250,
        ...(windowWidth < 1280 ? {
          bottom: windowWidth < 768 ? '8rem' : '7rem',
          left: windowWidth < 768 ? '1rem' : '1.5rem',
          right: windowWidth < 768 ? '1rem' : '1.5rem',
          width: 'auto',
          maxWidth: windowWidth < 768 ? '24rem' : '28rem',
          margin: '0 auto'
        } : {
          top: '5rem',
          right: '1.5rem',
          left: 'auto',
          bottom: 'auto',
          width: '24rem',
          maxWidth: '24rem',
          margin: 0
        })
      }}
      className={cn(
        "transition-all duration-300",
        className
      )}
    >
      <Card className={cn(
        "bg-card/95 backdrop-blur-xl border border-border/60 shadow-2xl overflow-hidden",
        "rounded-xl",
        "max-h-[60vh] lg:max-h-none"
      )}>
        <CardHeader className={cn(
          "pb-3",
          "px-4 py-3 md:px-6 md:py-4"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <Brain className="h-3.5 w-3.5 text-white" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">AI Reasoning</CardTitle>
                {topic && <div className="text-xs text-muted-foreground mt-0.5 truncate max-w-[200px] sm:max-w-none">{topic}</div>}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                onClick={onToggleVisibility}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-accent hover:text-accent-foreground text-muted-foreground md:h-7 md:w-7"
              >
                <X className="h-4 w-4 md:h-3.5 md:w-3.5" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className={cn(
          "pt-0",
          "px-4 pb-4 md:px-6 md:pb-6"
        )}>
          {isStreaming && !reasoningContent && (
            <div className="flex items-center gap-3 py-4 md:py-6">
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scale: [0.6, 1, 0.6],
                      opacity: [0.4, 1, 0.4],
                    }}
                    transition={{
                      duration: 1.2,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: i * 0.2,
                      ease: "easeInOut",
                    }}
                    className="w-2 h-2 rounded-full bg-primary"
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">AI is thinking...</span>
            </div>
          )}

          {reasoningContent && (
            <ScrollArea 
              ref={scrollAreaRef} 
              className={cn(
                "w-full",
                "h-48 sm:h-64 md:h-80"
              )}
            >
              <div ref={contentRef} className="space-y-3 pr-2">
                {/* Tool calls first */}
                {parsed.toolCalls.map((toolCall) => {
                  const result = parsed.toolResults.find((r) => r.id === toolCall.id)
                  return <ToolCallDisplay key={toolCall.id} toolCall={toolCall} result={result} />
                })}

                {/* Reasoning steps */}
                {reasoningSteps.length > 0 && (
                  <div className="space-y-2 md:space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      <Brain className="h-3 w-3" />
                      Thought Process
                    </div>
                    {reasoningSteps.map((step, index) => (
                      <ReasoningStepCard key={step.id} step={step} index={index} />
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          )}

          {!isStreaming && !reasoningContent && (
            <div className="text-sm text-muted-foreground text-center py-6 md:py-8">
              <Brain className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 opacity-50" />
              No reasoning data available
            </div>
          )}

          {isStreaming && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-lg bg-muted/30 border border-border/40 mt-2"
            >
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scale: [0.8, 1.2, 0.8],
                      opacity: [0.3, 1, 0.3],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: i * 0.3,
                      ease: "easeInOut",
                    }}
                    className="w-1.5 h-1.5 rounded-full bg-primary"
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground font-medium">
                AI is formulating thoughts
              </span>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
