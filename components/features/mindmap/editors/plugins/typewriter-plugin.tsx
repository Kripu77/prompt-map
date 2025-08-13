"use client";

import { useEffect, useRef } from 'react';
import { EditorState, $createTextNode, $insertNodes } from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { $convertFromMarkdownString, $convertToMarkdownString } from '@lexical/markdown';
import {
  $getRoot,
  $setSelection,
  $createRangeSelection,
  $isTextNode,
  $isElementNode,
  $getSelection,
} from 'lexical';
import { useMindmapStore } from '@/lib/stores/mindmap-store';
import { ENHANCED_TRANSFORMERS } from '../transformers/equation-transformers';

interface TypewriterPluginProps {
  streamingContent?: string;
  isStreaming?: boolean;
}

export function TypewriterPlugin({ streamingContent, isStreaming }: TypewriterPluginProps) {
  const [editor] = useLexicalComposerContext();
  const { mindmapData, setMindmapData } = useMindmapStore();
  const isInitializedRef = useRef(false);
  const lastMarkdownRef = useRef('');
  const lastStreamingContentRef = useRef('');
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Initialize editor with mindmap data
  useEffect(() => {
    if (mindmapData && mindmapData.trim() && mindmapData !== lastMarkdownRef.current && !isStreaming) {
      editor.update(() => {
        try {
          $convertFromMarkdownString(mindmapData, ENHANCED_TRANSFORMERS);
          lastMarkdownRef.current = mindmapData;
          isInitializedRef.current = true;
        } catch (error) {
          console.warn('Failed to parse markdown:', error);
        }
      });
    }
  }, [editor, mindmapData, isStreaming]);

  // Handle streaming content updates
  useEffect(() => {
    if (streamingContent && streamingContent !== lastStreamingContentRef.current) {
      lastStreamingContentRef.current = streamingContent;
      
      editor.update(() => {
        try {
          $convertFromMarkdownString(streamingContent, ENHANCED_TRANSFORMERS);
          
          // Position cursor at the end of content for blinking effect
          const root = $getRoot();
          const lastChild = root.getLastChild();
          if (lastChild) {
            const selection = $createRangeSelection();
            if ($isTextNode(lastChild)) {
              const textLength = lastChild.getTextContent().length;
              selection.anchor.set(lastChild.getKey(), textLength, 'text');
              selection.focus.set(lastChild.getKey(), textLength, 'text');
            } else if ($isElementNode(lastChild)) {
              const childrenSize = lastChild.getChildrenSize();
              selection.anchor.set(lastChild.getKey(), childrenSize, 'element');
              selection.focus.set(lastChild.getKey(), childrenSize, 'element');
            }
            $setSelection(selection);
          }
          
          lastMarkdownRef.current = streamingContent;
        } catch (error) {
          console.warn('Failed to parse streaming markdown:', error);
        }
      });
      
      // Auto-scroll to follow cursor
      setTimeout(() => {
        if (!scrollContainerRef.current) {
          scrollContainerRef.current = document.querySelector('.relative.flex-1.overflow-auto') as HTMLDivElement;
        }
        
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
      }, 10);
    }
  }, [editor, streamingContent, isStreaming]);

  // Reset initialization when new streaming starts
  useEffect(() => {
    if (isStreaming && streamingContent === '') {
      // Reset refs when new streaming starts
      lastStreamingContentRef.current = '';
      isInitializedRef.current = false;
    }
  }, [isStreaming, streamingContent]);

  // Handle changes from editor (when user types)
  const handleChange = (editorState: EditorState) => {
    if (!isStreaming) {
      editorState.read(() => {
        try {
          const markdown = $convertToMarkdownString(ENHANCED_TRANSFORMERS);
          // Only update if markdown actually changed to prevent infinite loops
          if (markdown !== lastMarkdownRef.current) {
            lastMarkdownRef.current = markdown;
            setMindmapData(markdown);
          }
        } catch (error) {
          console.warn('Failed to convert to markdown:', error);
        }
      });
    }
  };

  return <OnChangePlugin onChange={handleChange} />;
}

// Custom cursor component for typewriter effect
export function TypewriterCursor({ isVisible }: { isVisible: boolean }) {
  return (
    <span 
      className={`inline-block w-0.5 h-5 bg-foreground ml-0.5 transition-opacity duration-300 ${
        isVisible ? 'opacity-100 animate-pulse' : 'opacity-0'
      }`}
      style={{
        animation: isVisible ? 'blink 1s infinite' : 'none'
      }}
    />
  );
}