"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import { motion, animate } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Brain, Target, Lightbulb, Search, Zap, Globe, BookIcon, ExternalLink, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { MindmapMode } from "@/lib/types/settings"

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
  sources: Array<{ url: string; title?: string; content?: string }>
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
  const sources: Array<{ url: string; title?: string; content?: string }> = []
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

        if (result.results && Array.isArray(result.results)) {
          result.results.slice(0, 3).forEach((item: { url?: string; title?: string; content?: string; snippet?: string }) => {
            if (item.url) {
              sources.push({
                url: item.url,
                title: item.title || `Search Result`,
                content: item.content || item.snippet
              })
            }
          })
        }
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

  const urlRegex = /`(https?:\/\/[^\s`]+)`/g
  let match
  while ((match = urlRegex.exec(cleanText)) !== null) {
    sources.push({
      url: match[1],
      title: `Web Reference`,
      content: `Found relevant information at ${match[1]}`
    })
  }

  return {
    text: cleanText.trim(),
    toolCalls,
    toolResults,
    sources: sources.filter((source, index, self) => 
      index === self.findIndex(s => s.url === source.url)
    )
  }
}

function ToolDisplay({ toolCall, result }: { toolCall: ToolCall; result?: ToolResult }) {
  const isWebSearch = toolCall.name === "search.web"
  
  // Only show a compact summary for web searches, hide raw JSON
  if (isWebSearch) {
    const query = toolCall.args.query as string
    const resultCount = result?.result?.results ? (result.result.results as unknown[]).length : 0
    
    return (
      <div className="not-prose mb-3 w-full rounded-lg border bg-muted/20 border-border/40 overflow-hidden">
        <div className="flex w-full items-center justify-between gap-3 p-3">
          <div className="flex items-center gap-2">
            <Globe className="size-3.5 text-muted-foreground" />
            <span className="font-medium text-sm">Web Search</span>
            <div className="rounded-full text-xs bg-green-500/10 text-green-600 border border-green-500/30 px-2 py-0.5">
              {resultCount} results
            </div>
          </div>
        </div>
        <div className="px-3 pb-3">
          <p className="text-xs text-muted-foreground">
            Searched for: <span className="font-medium text-foreground">&quot;{query}&quot;</span>
          </p>
        </div>
      </div>
    )
  }

  // Hide other tool calls to reduce clutter
  return null
}

function ReasoningStepsDisplay({ steps }: { steps: ReasoningStep[] }) {
  const [showAll, setShowAll] = useState(false)
  
  const displayedSteps = showAll ? steps : steps.slice(0, 4)

  return (
    <>
      {displayedSteps.map((step, index) => (
        <ReasoningStepCard key={step.id} step={step} index={index} />
      ))}
      {steps.length > 4 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-xs text-muted-foreground hover:text-foreground text-center py-2 w-full hover:underline"
        >
          {showAll ? 'Show less' : `+${steps.length - 4} more steps`}
        </button>
      )}
    </>
  )
}

function SourcesDisplay({ sources }: { sources: Array<{ url: string; title?: string; content?: string }> }) {
  const [showAll, setShowAll] = useState(false)
  
  if (sources.length === 0) return null

  const displayedSources = showAll ? sources : sources.slice(0, 3)

  return (
    <div className="not-prose mb-3 text-primary text-xs">
      <div className="flex items-center gap-2 mb-2">
        <BookIcon className="h-3.5 w-3.5" />
        <p className="font-medium">Sources ({sources.length})</p>
      </div>
      <div className="flex flex-col gap-1.5 w-fit">
        {displayedSources.map((source, index) => (
          <a
            key={index}
            className="flex items-center gap-2 hover:underline text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            href={source.url}
            rel="noreferrer"
            target="_blank"
          >
            <ExternalLink className="h-2.5 w-2.5 flex-shrink-0" />
            <span className="block font-medium truncate max-w-[200px]">{source.title || source.url}</span>
          </a>
        ))}
        {sources.length > 3 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-xs text-muted-foreground hover:text-foreground ml-4 text-left hover:underline"
          >
            {showAll ? 'Show less' : `+${sources.length - 3} more sources`}
          </button>
        )}
      </div>
    </div>
  )
}


interface AIReasoningPanelProps {
  reasoningContent?: string
  isStreaming: boolean
  isVisible: boolean
  onToggleVisibility: () => void
  topic?: string
  className?: string,
  mode?: MindmapMode
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

  const smoothScrollToBottom = useCallback(() => {
    if (!scrollAreaRef.current || isUserScrollingRef.current) return

    const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]") as HTMLElement
    if (!scrollContainer) return

    const { scrollHeight, clientHeight, scrollTop } = scrollContainer
    const maxScrollTop = scrollHeight - clientHeight

    if (maxScrollTop <= 0 || scrollTop >= maxScrollTop - 5) return

    if (scrollAnimationRef.current?.stop) {
      scrollAnimationRef.current.stop()
    }

    const distance = maxScrollTop - scrollTop
    
    const duration = isStreaming 
      ? Math.min(0.6, Math.max(0.3, distance / 400))
      : Math.min(1.2, Math.max(0.5, distance / 300))

    const animation = animate(scrollTop, maxScrollTop, {
      duration,
      ease: isStreaming 
        ? [0.25, 0.46, 0.45, 0.94]
        : [0.08, 0.82, 0.17, 1],
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

  const throttledScrollTrigger = useCallback(() => {
    if (throttleTimeoutRef.current) {
      clearTimeout(throttleTimeoutRef.current)
    }

    const throttleDelay = isStreaming ? 50 : 200

    throttleTimeoutRef.current = setTimeout(() => {
      if (!isUserScrollingRef.current) {
        requestAnimationFrame(() => {
          smoothScrollToBottom()
        })
      }
    }, throttleDelay)
  }, [smoothScrollToBottom, isStreaming])

  const immediateScrollTrigger = useCallback(() => {
    if (!isUserScrollingRef.current) {
      requestAnimationFrame(() => {
        smoothScrollToBottom()
      })
    }
  }, [smoothScrollToBottom])

  useEffect(() => {
    const scrollContainer = scrollAreaRef.current?.querySelector("[data-radix-scroll-area-viewport]") as HTMLElement
    if (!scrollContainer) return

    let isScrolling = false

    const handleScroll = () => {
      if (!isScrolling) {
        isUserScrollingRef.current = true
        
        if (scrollAnimationRef.current?.stop) {
          scrollAnimationRef.current.stop()
        }
      }
      
      isScrolling = true
      
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
      
      scrollTimeoutRef.current = setTimeout(() => {
        isScrolling = false
        isUserScrollingRef.current = false
        
        if (isStreaming) {
          throttledScrollTrigger()
        }
      }, 1000)
    }

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [isStreaming, throttledScrollTrigger])

  useEffect(() => {
    if (!reasoningContent) {
      lastContentLength.current = 0
      return
    }

    const currentLength = reasoningContent.length
    
    if (isStreaming) {
      if (currentLength !== lastContentLength.current) {
        lastContentLength.current = currentLength
        immediateScrollTrigger()
      }
    } else {
      if (currentLength > lastContentLength.current) {
        lastContentLength.current = currentLength
        setTimeout(throttledScrollTrigger, 100)
      }
    }
  }, [reasoningContent, isStreaming, throttledScrollTrigger, immediateScrollTrigger])

  useEffect(() => {
    if (isStreaming && reasoningContent) {
      immediateScrollTrigger()
    }
  }, [reasoningContent, isStreaming, immediateScrollTrigger])

  useEffect(() => {
    if (isStreaming) {
      isUserScrollingRef.current = false
      immediateScrollTrigger()
    }
  }, [isStreaming, immediateScrollTrigger])

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  AI Reasoning
                </CardTitle>
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
              <div ref={contentRef} className="space-y-4 pr-2">
                {parsed.toolCalls.map((toolCall) => {
                  const result = parsed.toolResults.find((r) => r.id === toolCall.id)
                  return <ToolDisplay key={toolCall.id} toolCall={toolCall} result={result} />
                })}

                {parsed.sources.length > 0 && (
                  <SourcesDisplay sources={parsed.sources} />
                )}

                {reasoningSteps.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      <Lightbulb className="h-3 w-3" />
                      Thought Process
                    </div>
                    <ReasoningStepsDisplay steps={reasoningSteps} />
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
