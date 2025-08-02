"use client"

import { useState, useEffect, useRef, useCallback } from "react"
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.15, ease: "easeInOut" }}
      className={cn("rounded-lg p-4 border transition-all duration-200 hover:shadow-sm", getStepColor(step.type))}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
            step.type === "thought" && "bg-primary/10",
            step.type === "analysis" && "bg-primary/10",
            step.type === "decision" && "bg-primary/10",
            step.type === "action" && "bg-primary/10",
            !["thought", "analysis", "decision", "action"].includes(step.type) && "bg-muted/50",
          )}
        >
          {getStepIcon(step.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wide">{getStepLabel(step.type)}</span>
            <span className="text-xs text-muted-foreground">Step {index + 1}</span>
          </div>
          <p className="text-sm leading-relaxed text-foreground">{step.content}</p>
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
    <div className="bg-primary/5 rounded-lg p-4 border border-primary/20 mb-3">
      <div className="flex items-center gap-2 mb-3">
        <Search className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-primary">
          {isWebSearch ? "Web Search" : toolCall.name}
        </span>
      </div>
      {toolCall.args && typeof toolCall.args === "object" && toolCall.args !== null && "query" in toolCall.args && (
        <div className="text-sm text-muted-foreground mb-3">
          <span className="font-medium">Query:</span> {String(toolCall.args.query)}
        </div>
      )}
      {result && isWebSearch && <WebSearchResults results={result.result} />}
      {result && !isWebSearch && (
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">Result:</span> {JSON.stringify(result.result).substring(0, 200)}...
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
  const lastContentHeight = useRef(0)
  const isScrollingRef = useRef(false)

  // Enhanced smooth scroll with better easing and momentum
  const smoothScrollToBottom = useCallback(() => {
    if (!scrollAreaRef.current || isScrollingRef.current) return

    const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]") as HTMLElement
    if (!scrollContainer) return

    const { scrollHeight, clientHeight, scrollTop } = scrollContainer
    const maxScrollTop = scrollHeight - clientHeight

    // Only scroll if there's content to scroll and we're not already at the bottom
    if (maxScrollTop <= 0 || scrollTop >= maxScrollTop - 10) return

    // Stop any existing scroll animation
    if (scrollAnimationRef.current?.stop) {
      scrollAnimationRef.current.stop()
    }

    isScrollingRef.current = true

    // Calculate optimal duration based on distance with smooth scaling
    const distance = maxScrollTop - scrollTop
    const baseDuration = Math.min(Math.max(0.8, distance / 300), 2.5) // Between 0.8s and 2.5s

    // Create the scroll animation with natural easing
    const animation = animate(scrollTop, maxScrollTop, {
      duration: baseDuration,
      ease: [0.08, 0.82, 0.17, 1], // Custom cubic-bezier for river-like flow
      onUpdate: (value) => {
        if (scrollContainer) {
          scrollContainer.scrollTop = value
        }
      },
      onComplete: () => {
        isScrollingRef.current = false
        scrollAnimationRef.current = null
      },
    })

    scrollAnimationRef.current = { stop: animation.stop }
  }, [])

  // Debounced scroll trigger with intelligent timing
  const debouncedScrollTrigger = useCallback(() => {
    // Clear any existing animation before starting new one
    if (scrollAnimationRef.current?.stop) {
      scrollAnimationRef.current.stop()
    }

    // Use requestAnimationFrame for better timing coordination
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (!isScrollingRef.current) {
          smoothScrollToBottom()
        }
      }, 150) // Reduced delay for more responsive feel
    })
  }, [smoothScrollToBottom])

  // Enhanced content change detection
  useEffect(() => {
    if (!reasoningContent) return

    const contentElement = contentRef.current
    if (!contentElement) return

    // Use ResizeObserver for precise content size tracking
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newHeight = entry.contentRect.height

        // Only trigger scroll if content actually grew (new content added)
        if (newHeight > lastContentHeight.current && newHeight > 0) {
          lastContentHeight.current = newHeight
          debouncedScrollTrigger()
        }
      }
    })

    // Also use MutationObserver for DOM changes
    const mutationObserver = new MutationObserver((mutations) => {
      let shouldScroll = false

      mutations.forEach((mutation) => {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          shouldScroll = true
        }
      })

      if (shouldScroll) {
        debouncedScrollTrigger()
      }
    })

    resizeObserver.observe(contentElement)
    mutationObserver.observe(contentElement, {
      childList: true,
      subtree: true,
    })

    // Initial scroll trigger with slight delay
    setTimeout(debouncedScrollTrigger, 200)

    return () => {
      resizeObserver.disconnect()
      mutationObserver.disconnect()
      if (scrollAnimationRef.current?.stop) {
        scrollAnimationRef.current.stop()
      }
    }
  }, [reasoningContent, debouncedScrollTrigger])

  // Handle streaming state changes
  useEffect(() => {
    if (isStreaming && reasoningContent) {
      debouncedScrollTrigger()
    }
  }, [isStreaming, reasoningContent, debouncedScrollTrigger])

  // Additional effect to handle streaming content updates
  useEffect(() => {
    if (isStreaming) {
      const interval = setInterval(() => {
        debouncedScrollTrigger()
      }, 500) // Check every 500ms during streaming

      return () => clearInterval(interval)
    }
  }, [isStreaming, debouncedScrollTrigger])

  const reasoningSteps = parseReasoningIntoSteps(reasoningContent || "")
  const parsed = parseReasoningContent(reasoningContent || "")

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={cn("fixed top-20 right-6 z-40 w-96 max-w-sm", className)}
    >
      <Card className="bg-card/95 backdrop-blur-xl border border-border/60 shadow-2xl overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <Brain className="h-3.5 w-3.5 text-white" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">AI Reasoning</CardTitle>
                {topic && <div className="text-xs text-muted-foreground mt-0.5">{topic}</div>}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                onClick={onToggleVisibility}
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 hover:bg-accent hover:text-accent-foreground text-muted-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {isStreaming && !reasoningContent && (
            <div className="flex items-center gap-3 py-6">
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
            <ScrollArea ref={scrollAreaRef} className="h-80 w-full">
              <div ref={contentRef} className="space-y-3 pr-2">
                {/* Tool calls first */}
                {parsed.toolCalls.map((toolCall) => {
                  const result = parsed.toolResults.find((r) => r.id === toolCall.id)
                  return <ToolCallDisplay key={toolCall.id} toolCall={toolCall} result={result} />
                })}

                {/* Reasoning steps */}
                {reasoningSteps.length > 0 && (
                  <div className="space-y-3">
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
            <div className="text-sm text-muted-foreground text-center py-8">
              <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
              No reasoning data available
            </div>
          )}

          {isStreaming && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/40"
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
