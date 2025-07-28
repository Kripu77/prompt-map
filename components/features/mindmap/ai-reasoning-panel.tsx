"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, animate } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Brain, X, Minimize2, Maximize2, Search, ExternalLink, Globe, Lightbulb, Target, Zap } from "lucide-react"
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
        return "text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/30 border-blue-200/60 dark:border-blue-800/40"
      case "analysis":
        return "text-purple-600 dark:text-purple-400 bg-purple-50/80 dark:bg-purple-950/30 border-purple-200/60 dark:border-purple-800/40"
      case "decision":
        return "text-orange-600 dark:text-orange-400 bg-orange-50/80 dark:bg-orange-950/30 border-orange-200/60 dark:border-orange-800/40"
      case "action":
        return "text-green-600 dark:text-green-400 bg-green-50/80 dark:bg-green-950/30 border-green-200/60 dark:border-green-800/40"
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
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className={cn("rounded-lg p-4 border transition-all duration-200 hover:shadow-sm", getStepColor(step.type))}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
            step.type === "thought" && "bg-blue-100/80 dark:bg-blue-900/50",
            step.type === "analysis" && "bg-purple-100/80 dark:bg-purple-900/50",
            step.type === "decision" && "bg-orange-100/80 dark:bg-orange-900/50",
            step.type === "action" && "bg-green-100/80 dark:bg-green-900/50",
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
            <ExternalLink className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-foreground truncate">{result.title || "Web Result"}</div>
              {result.url && (
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-500 hover:text-blue-600 hover:underline truncate block"
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
    <div className="bg-blue-50/60 dark:bg-blue-950/25 rounded-lg p-4 border border-blue-200/40 dark:border-blue-800/25 mb-3">
      <div className="flex items-center gap-2 mb-3">
        <Search className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
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
  isVisible,
  onToggleVisibility,
  topic,
  className,
}: AIReasoningPanelProps) {
  const [isMinimized, setIsMinimized] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // Framer Motion smooth auto-scroll function
  const smoothScrollToBottom = React.useCallback(() => {
    if (!scrollAreaRef.current || isMinimized) return

    const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
    if (!scrollContainer) return

    const { scrollHeight, clientHeight, scrollTop } = scrollContainer
    const maxScrollTop = scrollHeight - clientHeight

    // Only scroll if content is scrollable and not already at bottom
    if (maxScrollTop > 0 && scrollTop < maxScrollTop - 10) {
      // Use Framer Motion's animate function for smooth scrolling
      animate(scrollTop, maxScrollTop, {
        duration: 0.2, // Slow and smooth
        ease: "easeOut",
        onUpdate: (value) => {
          scrollContainer.scrollTop = value
        },
      })
    }
  }, [isMinimized])

  // Watch for content changes and trigger smooth scroll
  useEffect(() => {
    if (!reasoningContent || isMinimized) return

    // Use ResizeObserver to detect when content size changes
    const contentElement = contentRef.current
    if (!contentElement) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // Trigger smooth scroll when content height increases
        if (entry.contentRect.height > 0) {
          // Small delay to ensure DOM is updated
          setTimeout(smoothScrollToBottom, 100)
        }
      }
    })

    resizeObserver.observe(contentElement)

    // Also trigger on initial content load
    setTimeout(smoothScrollToBottom, 200)

    return () => {
      resizeObserver.disconnect()
    }
  }, [reasoningContent, isMinimized, smoothScrollToBottom])

  // Trigger scroll when collapsible opens
  useEffect(() => {
    if (!isMinimized && reasoningContent) {
      // Delay to allow collapsible animation to complete
      setTimeout(smoothScrollToBottom, 400)
    }
  }, [isMinimized, reasoningContent, smoothScrollToBottom])

  if (!isVisible) return null

  const reasoningSteps = parseReasoningIntoSteps(reasoningContent || "")
  const parsed = parseReasoningContent(reasoningContent || "")

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.2}}
      className={cn("fixed top-20 right-6 z-40 w-96 max-w-sm", isMinimized && "w-auto", className)}
    >
      <Collapsible open={!isMinimized} onOpenChange={(open) => setIsMinimized(!open)}>
        <Card className="bg-card/95 backdrop-blur-xl border border-border/60 shadow-2xl overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <Brain className="h-3.5 w-3.5 text-white" />
                </div>
                {!isMinimized && (
                  <div>
                    <CardTitle className="text-sm font-semibold">AI Reasoning</CardTitle>
                    {topic && <div className="text-xs text-muted-foreground mt-0.5">{topic}</div>}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1">
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 hover:bg-accent hover:text-accent-foreground"
                  >
                    {isMinimized ? <Maximize2 className="h-3.5 w-3.5" /> : <Minimize2 className="h-3.5 w-3.5" />}
                  </Button>
                </CollapsibleTrigger>
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

          <CollapsibleContent className="data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
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
                          duration: 0.5,
                          repeat: Number.POSITIVE_INFINITY,
                          delay: i * 0.1,
                          ease: "easeInOut",
                        }}
                        className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
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
                          <ReasoningStepCard
                            key={step.id}
                            step={step}
                            index={index}
                          />
                        ))}

                        {/* Typing indicator when streaming */}
                        {isStreaming && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
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
                                    duration: 0.1,
                                    repeat: Number.POSITIVE_INFINITY,
                                    ease: "easeInOut",
                                  }}
                                  className="w-1.5 h-1.5 rounded-full bg-blue-500"
                                />
                              ))}
                            </div>
                            <span className="text-xs text-muted-foreground font-medium">
                              AI is formulating thoughts...
                            </span>
                          </motion.div>
                        )}
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
                <div className="mt-4 pt-3 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                      className="w-2 h-2 rounded-full bg-green-500"
                    />
                    <span className="text-xs text-muted-foreground">Live reasoning stream</span>
                  </div>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </motion.div>
  )
}
