"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Brain, ChevronDown, ChevronUp, X, Minimize2, Maximize2, Search, ExternalLink, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToolCall {
  id: string;
  name: string;
  args: Record<string, unknown>;
}

interface ToolResult {
  id: string;
  result: Record<string, unknown>;
}

interface ParsedReasoningContent {
  text: string;
  toolCalls: ToolCall[];
  toolResults: ToolResult[];
}

function parseReasoningContent(content: string): ParsedReasoningContent {
  const lines = content.split('\n');
  const toolCalls: ToolCall[] = [];
  const toolResults: ToolResult[] = [];
  let cleanText = '';

  for (const line of lines) {
    const toolCallMatch = line.match(/^\d+:\{"toolCallId":"([^"]+)","toolName":"([^"]+)","args":(.+)\}$/);
    if (toolCallMatch) {
      try {
        const args = JSON.parse(toolCallMatch[3]);
        toolCalls.push({
          id: toolCallMatch[1],
          name: toolCallMatch[2],
          args
        });
      } catch {
        cleanText += line + '\n';
      }
      continue;
    }

    const toolResultMatch = line.match(/^a:\{"toolCallId":"([^"]+)","result":(.+)\}$/);
    if (toolResultMatch) {
      try {
        const result = JSON.parse(toolResultMatch[2]);
        toolResults.push({
          id: toolResultMatch[1],
          result
        });
      } catch {
        cleanText += line + '\n';
      }
      continue;
    }

    if (line.startsWith('g:')) {
      continue;
    }

    if (line.trim()) {
      cleanText += line + '\n';
    }
  }

  return {
    text: cleanText.trim(),
    toolCalls,
    toolResults
  };
}

function WebSearchResults({ results }: { results: Record<string, unknown> }) {
  if (!results || !results.results) return null;

  const extractWebResults = (resultsData: unknown) => {
    if (Array.isArray(resultsData)) {
      return resultsData.slice(0, 3);
    }
    
    if (typeof resultsData === 'string') {
      const urlRegex = /`(https?:\/\/[^\s`]+)`/g;
      const urls = [];
      let match;
      while ((match = urlRegex.exec(resultsData)) !== null) {
        urls.push(match[1]);
      }
      
      return urls.slice(0, 3).map((url, index) => ({
        url,
        title: `Search Result ${index + 1}`,
        content: `Found relevant information at ${url}`
      }));
    }

    return [];
  };

  const webResults = extractWebResults(results.results);
  
  if (webResults.length === 0) return null;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
        <Globe className="h-3 w-3" />
        Web Search Results
      </div>
      {webResults.map((result, index) => (
        <div key={index} className="bg-muted/20 rounded-md p-2 border border-border/30">
          <div className="flex items-start gap-2">
            <ExternalLink className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-foreground truncate">
                {result.title || 'Web Result'}
              </div>
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
  );
}

function ToolCallDisplay({ toolCall, result }: { toolCall: ToolCall; result?: ToolResult }) {
  const isWebSearch = toolCall.name === 'search.web';
  
  return (
    <div className="bg-blue-50/50 dark:bg-blue-950/20 rounded-md p-3 border border-blue-200/50 dark:border-blue-800/30 mb-3">
      <div className="flex items-center gap-2 mb-2">
        <Search className="h-3 w-3 text-blue-600 dark:text-blue-400" />
        <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
          {isWebSearch ? 'Web Search' : toolCall.name}
        </span>
      </div>
      
      {toolCall.args && typeof toolCall.args === 'object' && toolCall.args !== null && 'query' in toolCall.args && (
        <div className="text-xs text-muted-foreground mb-2">
          <span className="font-medium">Query:</span> {String(toolCall.args.query)}
        </div>
      )}
      
      {result && isWebSearch && (
        <WebSearchResults results={result.result} />
      )}
      
      {result && !isWebSearch && (
        <div className="text-xs text-muted-foreground">
          <span className="font-medium">Result:</span> {JSON.stringify(result.result).substring(0, 200)}...
        </div>
      )}
    </div>
  );
}

interface AIReasoningPanelProps {
  reasoningContent?: string;
  isStreaming: boolean;
  isVisible: boolean;
  onToggleVisibility: () => void;
  topic?: string;
  className?: string;
}

export function AIReasoningPanel({
  reasoningContent,
  isStreaming,
  isVisible,
  onToggleVisibility,
  topic,
  className,
}: AIReasoningPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollHeightRef = useRef<number>(0);

  useEffect(() => {
    if (reasoningContent && !isExpanded) {
      setIsExpanded(true);
    }
  }, [reasoningContent, isExpanded]);

  useEffect(() => {
    if (isStreaming && reasoningContent && scrollAreaRef.current && isExpanded && !isMinimized) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-slot="scroll-area-viewport"]') as HTMLElement;
      if (scrollContainer) {
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
        
        scrollTimeoutRef.current = setTimeout(() => {
          requestAnimationFrame(() => {
            try {
              const maxScrollTop = scrollContainer.scrollHeight - scrollContainer.clientHeight;
              const currentScrollTop = scrollContainer.scrollTop;
              
              const isNearBottom = currentScrollTop >= maxScrollTop - 100;
              const hasNewContent = scrollContainer.scrollHeight > lastScrollHeightRef.current;
              
              if (isNearBottom || hasNewContent) {
                lastScrollHeightRef.current = scrollContainer.scrollHeight;
                
                const startTime = performance.now();
                const startScrollTop = currentScrollTop;
                const targetScrollTop = maxScrollTop;
                const distance = targetScrollTop - startScrollTop;
                const duration = Math.min(400, Math.max(150, Math.abs(distance) * 1.5));
                
                const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
                
                const animateScroll = (currentTime: number) => {
                  const elapsed = currentTime - startTime;
                  const progress = Math.min(elapsed / duration, 1);
                  const easedProgress = easeOutQuart(progress);
                  
                  scrollContainer.scrollTop = startScrollTop + (distance * easedProgress);
                  
                  if (progress < 1) {
                    requestAnimationFrame(animateScroll);
                  }
                };
                
                requestAnimationFrame(animateScroll);
              }
            } catch {
              scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
          });
        }, 50);
      }
    }
    
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [reasoningContent, isStreaming, isExpanded, isMinimized]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className={cn(
        "fixed top-20 right-6 z-40 w-80 max-w-sm",
        isMinimized && "w-auto",
        className
      )}
    >
      <Card className="bg-background/95 backdrop-blur-xl border border-border shadow-2xl overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.div
                animate={isStreaming ? { 
                  rotate: [0, 360],
                  scale: [1, 1.05, 1]
                } : {}}
                transition={isStreaming ? { 
                  rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                } : {}}
                className="w-5 h-5 rounded-full bg-primary flex items-center justify-center"
              >
                <Brain className="h-3 w-3 text-primary-foreground" />
              </motion.div>
              {!isMinimized && (
                <CardTitle className="text-sm font-medium">AI Reasoning</CardTitle>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              {!isMinimized && (
                <Button
                  onClick={() => setIsExpanded(!isExpanded)}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-secondary"
                >
                  {isExpanded ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </Button>
              )}
              
              <Button
                onClick={() => setIsMinimized(!isMinimized)}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-secondary"
              >
                {isMinimized ? (
                  <Maximize2 className="h-3 w-3" />
                ) : (
                  <Minimize2 className="h-3 w-3" />
                )}
              </Button>
              
              <Button
                onClick={onToggleVisibility}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-secondary text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          {!isMinimized && topic && (
            <div className="text-xs text-muted-foreground mt-1">
              Thinking about: <span className="font-medium">{topic}</span>
            </div>
          )}
        </CardHeader>
        
        <AnimatePresence>
          {!isMinimized && isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CardContent className="pt-0">
                {isStreaming && !reasoningContent && (
                  <div className="flex items-center gap-2 py-4">
                    <div className="flex gap-1">
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{
                            scale: [0.6, 1, 0.6],
                            opacity: [0.4, 1, 0.4],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: i * 0.2,
                            ease: "easeInOut"
                          }}
                          className="w-2 h-2 rounded-full bg-primary"
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      AI is thinking...
                    </span>
                  </div>
                )}
                
                {reasoningContent && (
                  <ScrollArea ref={scrollAreaRef} className="h-64 w-full">
                    <div ref={contentRef} className="space-y-2">
                      <div className="text-xs text-muted-foreground font-medium mb-2">
                        Thought Process:
                      </div>
                      
                      {(() => {
                        const parsed = parseReasoningContent(reasoningContent);
                        
                        return (
                          <div className="space-y-3">
                            {parsed.toolCalls.map((toolCall) => {
                              const result = parsed.toolResults.find(r => r.id === toolCall.id);
                              return (
                                <ToolCallDisplay 
                                  key={toolCall.id} 
                                  toolCall={toolCall} 
                                  result={result} 
                                />
                              );
                            })}
                            
                            {parsed.text && (
                              <div className="text-xs text-foreground whitespace-pre-wrap font-mono leading-relaxed bg-muted/30 rounded-md p-3 border">
                                {parsed.text}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </ScrollArea>
                )}
                
                {!isStreaming && !reasoningContent && (
                  <div className="text-xs text-muted-foreground text-center py-4">
                    No reasoning data available
                  </div>
                )}
                
                {isStreaming && (
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="w-2 h-2 rounded-full bg-green-500"
                      />
                      <span className="text-xs text-muted-foreground">
                        Live reasoning stream
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}