"use client";

import { useEffect, useRef } from 'react';
import { EditorState } from 'lexical';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { TRANSFORMERS } from '@lexical/markdown';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $convertFromMarkdownString, $convertToMarkdownString } from '@lexical/markdown';

// Lexical nodes
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListItemNode, ListNode } from '@lexical/list';
import { LinkNode, AutoLinkNode } from '@lexical/link';
import { CodeNode, CodeHighlightNode } from '@lexical/code';

import { useMindmapStore } from '@/lib/stores/mindmap-store';
import { cn } from '@/lib/utils';

const theme = {
  ltr: 'ltr',
  rtl: 'rtl',
  placeholder: 'text-slate-500',
  paragraph: 'mb-3 leading-relaxed',
  quote: 'border-l-4 border-slate-300 pl-4 italic  my-4',
  heading: {
    h1: 'text-3xl font-bold mb-4 mt-6 border-b border-slate-200 pb-2',
    h2: 'text-2xl font-bold mb-3 mt-5',
    h3: 'text-xl font-semibold mb-2 mt-4',
    h4: 'text-lg font-semibold mb-2 mt-3 ',
    h5: 'text-base font-semibold mb-1 mt-2 ',
    h6: 'text-sm font-semibold mb-1 mt-2',
  },
  list: {
    nested: {
      listitem: 'list-none',
    },
    ol: 'list-decimal ml-6 mb-3 space-y-1',
    ul: 'list-disc ml-6 mb-3 space-y-1',
    listitem: 'leading-relaxed',
  },
  link: 'text-blue-600 hover:text-blue-800 underline cursor-pointer',
  text: {
    bold: 'font-semibold',
    italic: 'italic',
    underline: 'underline',
    strikethrough: 'line-through',
    underlineStrikethrough: 'underline line-through',
    code: 'bg-slate-100 px-1.5 py-0.5 rounded text-sm font-mono text-slate-800',
  },
  code: 'bg-slate-100 p-3 rounded-md font-mono text-sm border my-3',
  codeHighlight: {
    atrule: 'text-purple-600',
    attr: 'text-blue-600',
    boolean: 'text-red-600',
    builtin: 'text-purple-600',
    cdata: 'text-gray-600',
    char: 'text-green-600',
    class: 'text-blue-600',
    'class-name': 'text-blue-600',
    comment: 'text-gray-500',
    constant: 'text-red-600',
    deleted: 'text-red-600',
    doctype: 'text-gray-600',
    entity: 'text-orange-600',
    function: 'text-purple-600',
    important: 'text-red-600',
    inserted: 'text-green-600',
    keyword: 'text-purple-600',
    namespace: 'text-blue-600',
    number: 'text-red-600',
    operator: 'text-gray-700',
    prolog: 'text-gray-600',
    property: 'text-blue-600',
    punctuation: 'text-gray-700',
    regex: 'text-green-600',
    selector: 'text-green-600',
    string: 'text-green-600',
    symbol: 'text-red-600',
    tag: 'text-red-600',
    url: 'text-blue-600',
    variable: 'text-orange-600',
  },
};

function onError(error: Error) {
  console.error('Lexical error:', error);
}

// Plugin to sync with mindmap store
function MarkdownSyncPlugin() {
  const [editor] = useLexicalComposerContext();
  const { mindmapData, setMindmapData } = useMindmapStore();
  const isInitializedRef = useRef(false);
  const lastMarkdownRef = useRef('');

  // Initialize editor with mindmap data
  useEffect(() => {
    if (!isInitializedRef.current && mindmapData && mindmapData.trim()) {
      editor.update(() => {
        try {
          $convertFromMarkdownString(mindmapData, TRANSFORMERS);
          lastMarkdownRef.current = mindmapData;
          isInitializedRef.current = true;
        } catch (error) {
          console.warn('Failed to parse markdown:', error);
        }
      });
    }
  }, [editor, mindmapData]);

  // Handle changes from editor
  const handleChange = (editorState: EditorState) => {
    editorState.read(() => {
      try {
        const markdown = $convertToMarkdownString(TRANSFORMERS);
        // Only update if markdown actually changed to prevent infinite loops
        if (markdown !== lastMarkdownRef.current) {
          lastMarkdownRef.current = markdown;
          setMindmapData(markdown);
        }
      } catch (error) {
        console.warn('Failed to convert to markdown:', error);
      }
    });
  };

  return <OnChangePlugin onChange={handleChange} />;
}

// Toolbar component
function Toolbar() {
  return (
    <div className="flex items-center gap-1 p-2 border-b ">
      <div className="text-sm font-medium">
         Mindmap Editor
      </div>
      <div className="flex-1" />
      <div className="text-xs">
        Use Markdown shortcuts: # for headings, * for lists
      </div>
    </div>
  );
}

interface RichTextEditorProps {
  className?: string;
}

export function RichTextEditor({ className }: RichTextEditorProps) {
  const initialConfig = {
    namespace: 'MindmapEditor',
    theme,
    onError,
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      QuoteNode,
      LinkNode,
      AutoLinkNode,
      CodeNode,
      CodeHighlightNode,
    ],
  };

  return (
    <div className={cn("border rounded-lg flex flex-col h-full", className)}>
      <LexicalComposer initialConfig={initialConfig}>
        <Toolbar />
        <div className="relative flex-1 overflow-auto">
          <RichTextPlugin
            contentEditable={
              <ContentEditable 
                className="min-h-[400px] p-6 outline-none resize-none text-base leading-relaxed focus:outline-none"
                style={{ caretColor: 'rgb(5, 5, 5)' }}
              />
            }
            placeholder={
              <div className="absolute top-6 left-6 pointer-events-none text-base">
                Start editing your mind map content...
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <AutoFocusPlugin />
          <LinkPlugin />
          <ListPlugin />
          <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
          <MarkdownSyncPlugin />
        </div>
      </LexicalComposer>
    </div>
  );
}