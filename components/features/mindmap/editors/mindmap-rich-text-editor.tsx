"use client";

import React from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListItemNode, ListNode } from '@lexical/list';
import { LinkNode, AutoLinkNode } from '@lexical/link';
import { CodeNode, CodeHighlightNode } from '@lexical/code';
import { TableNode, TableCellNode, TableRowNode } from '@lexical/table';
import { cn } from '@/lib/utils';


// Import modular components
import { EquationNode } from './nodes/equation-node';
import { TypewriterPlugin } from './plugins/typewriter-plugin';
import { CodeHighlightPlugin } from './plugins/code-highlight-plugin';
import { CustomLinkPlugin } from './plugins/custom-link-plugin';
import { EquationPlugin } from './plugins/equation-plugin';
import ToolbarPlugin from './components/toolbar';
import { InlineCitationRenderer } from './components/inline-citation-renderer';
import { ENHANCED_TRANSFORMERS } from './transformers/equation-transformers';
import { editorTheme, onError } from './config/editor-theme';

// Source data interface
interface SourceData {
  title?: string;
  url: string;
  description?: string;
}

// Props interface
interface MindmapRichTextEditorProps {
  className?: string;
  streamingContent?: string;
  isStreaming?: boolean;
  sources?: SourceData[];
}

export function MindmapRichTextEditor({ 
  className, 
  streamingContent, 
  isStreaming, 
  sources 
}: MindmapRichTextEditorProps) {
  const initialConfig = {
    namespace: 'MindmapEditor',
    theme: editorTheme,
    onError,
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      QuoteNode,
      CodeNode,
      CodeHighlightNode,
      LinkNode,
      AutoLinkNode,
      EquationNode,
      TableNode,
      TableCellNode,
      TableRowNode,
    ],
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <LexicalComposer initialConfig={initialConfig}>
        <ToolbarPlugin />
        
        {/* Main Editor */}
        <div className="relative flex-1 overflow-auto">
          <RichTextPlugin
            contentEditable={
              <ContentEditable 
                className="h-full min-h-full p-4 outline-none resize-none overflow-auto text-foreground"
                style={{
                  caretColor: 'auto',
                }}
              />
            }
            placeholder={
              <div className="absolute top-4 left-4 text-muted-foreground pointer-events-none select-none">
                Start typing your mindmap content...
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          
          {/* Plugins */}
          <HistoryPlugin />
          <AutoFocusPlugin />
          <TablePlugin/>
          <LinkPlugin />
          <ListPlugin />
      
          <MarkdownShortcutPlugin transformers={ENHANCED_TRANSFORMERS} />

          
          {/* Custom Plugins */}
          <TypewriterPlugin 
            streamingContent={streamingContent} 
            isStreaming={isStreaming} 
          />
          <CodeHighlightPlugin />
          <CustomLinkPlugin />
          <EquationPlugin />
        </div>
        
        {/* Inline Citations */}
        {sources && sources.length > 0 && (
          <InlineCitationRenderer sources={sources} />
        )}
      </LexicalComposer>
      
      {/* Typewriter cursor effect styles */}
      <style jsx>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        
        .typewriter-cursor {
          animation: blink 1s infinite;
        }
        
        .editor-shell {
          background: transparent;
        }
        
        .editor-shell .editor-container {
          background: transparent;
          position: relative;
        }
        
        .editor-shell .editor-scroller {
          min-height: 100%;
          border: 0;
          display: flex;
          position: relative;
          outline: 0;
          z-index: 0;
          overflow: auto;
          resize: none;
        }
        
        .editor-shell .editor {
          flex: auto;
          position: relative;
          resize: none;
          z-index: -1;
        }
      `}</style>
    </div>
  );
}