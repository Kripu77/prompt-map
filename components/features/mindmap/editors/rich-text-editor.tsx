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
import { TRANSFORMERS, ElementTransformer, TextMatchTransformer } from '@lexical/markdown';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $convertFromMarkdownString, $convertToMarkdownString } from '@lexical/markdown';
import { registerCodeHighlighting } from '@lexical/code';
import { $createTextNode, $getSelection, $isRangeSelection, TextNode, DecoratorNode, NodeKey, LexicalNode, SerializedLexicalNode, Spread, COMMAND_PRIORITY_EDITOR, createCommand, LexicalCommand, KEY_DOWN_COMMAND, COMMAND_PRIORITY_LOW } from 'lexical';
import { $createCodeNode } from '@lexical/code';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Lexical nodes
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListItemNode, ListNode } from '@lexical/list';
import { LinkNode, AutoLinkNode, $createLinkNode } from '@lexical/link';
import { $isLinkNode } from '@lexical/link';


import { CodeNode, CodeHighlightNode } from '@lexical/code';

// Enhanced Math Node following Lexical playground patterns
type SerializedEquationNode = Spread<
  {
    equation: string;
    inline: boolean;
  },
  SerializedLexicalNode
>;

class EquationNode extends DecoratorNode<ReactNode> {
  __equation: string;
  __inline: boolean;

  static getType(): string {
    return 'equation';
  }

  static clone(node: EquationNode): EquationNode {
    return new EquationNode(node.__equation, node.__inline, node.__key);
  }

  constructor(equation: string, inline: boolean, key?: NodeKey) {
    super(key);
    this.__equation = equation;
    this.__inline = inline;
  }

  createDOM(): HTMLElement {
    const element = document.createElement(this.__inline ? 'span' : 'div');
    element.className = this.__inline ? 'math-inline' : 'math-block';
    if (!this.__inline) {
      element.style.textAlign = 'center';
      element.style.margin = '1em 0';
    }
    return element;
  }

  updateDOM(): false {
    return false;
  }

  static importJSON(serializedNode: SerializedEquationNode): EquationNode {
    const { equation, inline } = serializedNode;
    return $createEquationNode(equation, inline);
  }

  exportJSON(): SerializedEquationNode {
    return {
      equation: this.__equation,
      inline: this.__inline,
      type: 'equation',
      version: 1,
    };
  }

  getTextContent(): string {
    return this.__equation;
  }

  decorate(): ReactNode {
    try {
      // Validate LaTeX before rendering
      if (!this.__equation || this.__equation.trim() === '') {
            return (
              <span className={`equation-placeholder ${theme.equationError}`}>
                [Empty Equation]
              </span>
            );
          }

      const html = katex.renderToString(this.__equation, {
        displayMode: !this.__inline,
        throwOnError: false,
        errorColor: '#cc0000',
        strict: 'warn',
        trust: false, // Security: don't trust arbitrary commands
        macros: {
          // Add common macros for better compatibility
          '\\RR': '\\mathbb{R}',
          '\\NN': '\\mathbb{N}',
          '\\ZZ': '\\mathbb{Z}',
          '\\QQ': '\\mathbb{Q}',
          '\\CC': '\\mathbb{C}',
        }
      });
      
      return (
          <span 
              dangerouslySetInnerHTML={{ __html: html }}
              className={`${this.__inline ? 'equation-inline' : 'equation-block'} ${this.__inline ? theme.equationInline : theme.equationBlock}`}
              style={this.__inline ? {} : { display: 'block', textAlign: 'center', margin: '1em 0' }}
              title={`LaTeX: ${this.__equation}`} // Show raw LaTeX on hover
              onClick={() => {
                // Future: Could implement inline editing here
                console.log('Equation node clicked:', this.__equation);
              }}
            />
        );
    } catch (error) {
      console.error('KaTeX rendering error:', error, 'LaTeX:', this.__equation);
      return (
          <span className={`equation-error ${theme.equationError}`} title={`Error: ${error}`}>
              [Equation Error: {this.__equation}]
            </span>
        );
    }
  }
}

function $createEquationNode(equation: string, inline: boolean): EquationNode {
  return new EquationNode(equation, inline);
}

function $isEquationNode(node: LexicalNode | null | undefined): node is EquationNode {
  return node instanceof EquationNode;
}

// Math transformers for markdown integration
const EQUATION_TRANSFORMERS: Array<TextMatchTransformer> = [
  // Block math transformer: $$...$$
  {
    dependencies: [EquationNode],
    export: (node: LexicalNode) => {
      if (!$isEquationNode(node)) {
        return null;
      }
      const equation = node.__equation;
      return node.__inline ? `$${equation}$` : `$$${equation}$$`;
    },
    importRegExp: /\$\$([^$]+?)\$\$/,
    regExp: /\$\$([^$]+?)\$\$/,
    replace: (textNode, match) => {
      const [, equation] = match;
      const mathNode = $createEquationNode(equation.trim(), false);
      textNode.replace(mathNode);
    },
    trigger: '$',
    type: 'text-match',
  },
  // Inline math transformer: $...$
  {
    dependencies: [EquationNode],
    export: (node: LexicalNode) => {
      if (!$isEquationNode(node)) {
        return null;
      }
      const equation = node.__equation;
      return node.__inline ? `$${equation}$` : `$$${equation}$$`;
    },
    importRegExp: /(?<!\$)\$([^$\n]+?)\$(?!\$)/,
    regExp: /(?<!\$)\$([^$\n]+?)\$(?!\$)/,
    replace: (textNode, match) => {
      const [, equation] = match;
      const mathNode = $createEquationNode(equation.trim(), true);
      textNode.replace(mathNode);
    },
    trigger: '$',
    type: 'text-match',
  },
];

// Enhanced transformers including math
const ENHANCED_TRANSFORMERS = [...TRANSFORMERS, ...EQUATION_TRANSFORMERS];

// Commands for math insertion
export const INSERT_INLINE_MATH_COMMAND: LexicalCommand<string> = createCommand('INSERT_INLINE_MATH_COMMAND');
export const INSERT_BLOCK_MATH_COMMAND: LexicalCommand<string> = createCommand('INSERT_BLOCK_MATH_COMMAND');

// Commands for code insertion
export const INSERT_CODE_BLOCK_COMMAND: LexicalCommand<string> = createCommand('INSERT_CODE_BLOCK_COMMAND');

import { useMindmapStore } from '@/lib/stores/mindmap-store';
import { cn } from '@/lib/utils';

const theme = {
  ltr: 'ltr',
  rtl: 'rtl',
  placeholder: 'text-muted-foreground',
  paragraph: 'mb-3 leading-relaxed text-foreground',
  quote: 'border-l-4 border-border pl-4 italic my-4 text-muted-foreground',
  heading: {
    h1: 'text-2xl font-bold mb-4 mt-6 border-b border-border pb-2 text-foreground',
    h2: 'text-xl font-bold mb-3 mt-5 text-foreground',
    h3: 'text-lg font-semibold mb-2 mt-4 text-foreground',
    h4: 'text-md font-semibold mb-2 mt-3 text-foreground',
    h5: 'text-sm font-semibold mb-1 mt-2 text-foreground',
    h6: 'text-xs font-semibold mb-1 mt-2 text-foreground',
  },
  list: {
    nested: {
      listitem: 'list-none',
    },
    ol: 'list-decimal ml-6 mb-3 space-y-1 text-foreground',
    ul: 'list-disc ml-6 mb-3 space-y-1 text-foreground',
    listitem: 'leading-relaxed text-foreground',
  },
  link: 'text-primary hover:text-primary/80 underline cursor-pointer',
  text: {
    bold: 'font-semibold text-foreground',
    italic: 'italic text-foreground',
    underline: 'underline text-foreground',
    strikethrough: 'line-through text-foreground',
    underlineStrikethrough: 'underline line-through text-foreground',
    code: 'bg-muted px-2 py-1 rounded text-sm font-mono text-foreground whitespace-nowrap',
  },
  code: 'bg-muted p-4 rounded-lg font-mono text-sm border border-border my-4 overflow-x-auto whitespace-pre-wrap block text-foreground',
  codeHighlight: {
    atrule: 'text-purple-600 dark:text-purple-400',
    attr: 'text-blue-600 dark:text-blue-400',
    boolean: 'text-red-600 dark:text-red-400',
    builtin: 'text-purple-600 dark:text-purple-400',
    cdata: 'text-muted-foreground',
    char: 'text-green-600 dark:text-green-400',
    class: 'text-blue-600 dark:text-blue-400',
    'class-name': 'text-blue-600 dark:text-blue-400',
    comment: 'text-muted-foreground',
    constant: 'text-red-600 dark:text-red-400',
    deleted: 'text-red-600 dark:text-red-400',
    doctype: 'text-muted-foreground',
    entity: 'text-orange-600 dark:text-orange-400',
    function: 'text-purple-600 dark:text-purple-400',
    important: 'text-red-600 dark:text-red-400',
    inserted: 'text-green-600 dark:text-green-400',
    keyword: 'text-purple-600 dark:text-purple-400',
    namespace: 'text-blue-600 dark:text-blue-400',
    number: 'text-red-600 dark:text-red-400',
    operator: 'text-foreground',
    prolog: 'text-muted-foreground',
    property: 'text-blue-600 dark:text-blue-400',
    punctuation: 'text-foreground',
    regex: 'text-green-600 dark:text-green-400',
    selector: 'text-green-600 dark:text-green-400',
    string: 'text-green-600 dark:text-green-400',
    symbol: 'text-red-600 dark:text-red-400',
    tag: 'text-red-600 dark:text-red-400',
    url: 'text-blue-600 dark:text-blue-400',
    variable: 'text-orange-600 dark:text-orange-400',
  },
  // Equation styling following Lexical playground patterns
  equationInline: 'inline-block align-baseline text-foreground',
  equationBlock: 'block text-center my-4 overflow-x-auto text-foreground',
  equationError: 'text-destructive font-mono text-sm bg-destructive/10 px-2 py-1 rounded',
  equationPlaceholder: 'text-muted-foreground font-mono text-sm bg-muted px-2 py-1 rounded border-dashed border-border',
};

function onError(error: Error) {
  console.error('Lexical error:', error);
}

// Plugin to sync with mindmap store
function MarkdownSyncPlugin({ streamingContent }: { streamingContent?: string }) {
  const [editor] = useLexicalComposerContext();
  const { mindmapData, setMindmapData } = useMindmapStore();
  const isInitializedRef = useRef(false);
  const lastMarkdownRef = useRef('');
  const lastStreamingContentRef = useRef('');

  // Initialize editor with mindmap data
  useEffect(() => {
    if (!isInitializedRef.current && mindmapData && mindmapData.trim()) {
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
  }, [editor, mindmapData]);

  // Handle streaming content updates
  useEffect(() => {
    if (streamingContent && streamingContent !== lastStreamingContentRef.current) {
      lastStreamingContentRef.current = streamingContent;
      editor.update(() => {
        try {
          $convertFromMarkdownString(streamingContent, ENHANCED_TRANSFORMERS);
          lastMarkdownRef.current = streamingContent;
        } catch (error) {
          console.warn('Failed to parse streaming markdown:', error);
        }
      });
    }
  }, [editor, streamingContent]);

  // Handle changes from editor
  const handleChange = (editorState: EditorState) => {
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
  };

  return <OnChangePlugin onChange={handleChange} />;
}

// Plugin to handle auto-scroll during streaming
function AutoScrollPlugin({ isStreaming, streamingContent }: { isStreaming: boolean; streamingContent?: string }) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom when streaming content updates
  useEffect(() => {
    if (isStreaming && streamingContent) {
      // Find the scroll container (the div with overflow-auto class)
      if (!scrollContainerRef.current) {
        scrollContainerRef.current = document.querySelector('.relative.flex-1.overflow-auto') as HTMLDivElement;
      }
      
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      }
    }
  }, [isStreaming, streamingContent]);

  return null;
}

// Enhanced Toolbar Component with Math and Code
const EnhancedToolbar: React.FC = () => {
  const [editor] = useLexicalComposerContext();

  const insertInlineMath = (latex: string) => {
    editor.dispatchCommand(INSERT_INLINE_MATH_COMMAND, latex);
  };

  const insertBlockMath = (latex: string) => {
    editor.dispatchCommand(INSERT_BLOCK_MATH_COMMAND, latex);
  };

  const insertCodeBlock = (language: string = '') => {
    editor.dispatchCommand(INSERT_CODE_BLOCK_COMMAND, language);
  };

  const mathTemplates = [
    { label: 'Fraction', inline: '\\frac{a}{b}', block: '\\frac{\\sum_{i=1}^{n} x_i}{n}' },
    { label: 'Square Root', inline: '\\sqrt{x}', block: '\\sqrt{x^2 + y^2}' },
    { label: 'Integral', inline: '\\int f(x)dx', block: '\\int_{a}^{b} f(x) \\, dx' },
    { label: 'Sum', inline: '\\sum x_i', block: '\\sum_{i=1}^{n} x_i' },
    { label: 'Limit', inline: '\\lim_{x \\to 0} f(x)', block: '\\lim_{x \\to \\infty} \\frac{1}{x}' },
    { label: 'Matrix', inline: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}', block: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}' },
  ];

  const codeLanguages = [
    { label: 'JavaScript', value: 'javascript' },
    { label: 'Python', value: 'python' },
    { label: 'TypeScript', value: 'typescript' },
    { label: 'HTML', value: 'html' },
    { label: 'CSS', value: 'css' },
    { label: 'JSON', value: 'json' },
  ];

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1 p-2 border-b bg-muted/50 flex-wrap">
        {/* Code Section */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => insertCodeBlock()}
                className="h-8 px-2 text-xs font-mono"
              >
                {'</>'}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Insert code block (Ctrl+Shift+C)</p>
            </TooltipContent>
          </Tooltip>
          
          {codeLanguages.map((lang, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => insertCodeBlock(lang.value)}
                  className="h-8 px-2 text-xs"
                >
                  {lang.label}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Insert {lang.label} code block</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
        
        <Separator orientation="vertical" className="h-6" />
        
        {/* Math Section */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => insertInlineMath('x = y')}
                className="h-8 px-2 text-xs"
              >
                $...$
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Insert inline math (Ctrl+Shift+M)</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => insertBlockMath('\\sum_{i=1}^{n} x_i')}
                className="h-8 px-2 text-xs"
              >
                $$...$$
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Insert block math (Ctrl+Alt+M)</p>
            </TooltipContent>
          </Tooltip>
        </div>
        
        <Separator orientation="vertical" className="h-6" />
        
        <div className="flex items-center gap-1 flex-wrap">
          {mathTemplates.map((template, index) => (
            <div key={index} className="flex">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insertInlineMath(template.inline)}
                    className="h-8 px-2 text-xs border-r-0 rounded-r-none"
                  >
                    {template.label}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Insert {template.label.toLowerCase()} (inline)</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insertBlockMath(template.block)}
                    className="h-8 px-1 text-xs rounded-l-none border-l border-gray-300"
                  >
                    $$
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Insert {template.label.toLowerCase()} (block)</p>
                </TooltipContent>
              </Tooltip>
            </div>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
};

// Enhanced Code Highlighting Plugin with Commands
function CodeHighlightPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Register code highlighting
    const removeCodeHighlighting = registerCodeHighlighting(editor);
    
    // Register code block insertion command
    const removeCodeBlockCommand = editor.registerCommand(
      INSERT_CODE_BLOCK_COMMAND,
      (language: string) => {
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const codeNode = $createCodeNode(language);
            selection.insertNodes([codeNode]);
          }
        });
        return true;
      },
      COMMAND_PRIORITY_EDITOR
    );

    // Register keyboard shortcuts for code
    const removeKeyDownListener = editor.registerCommand(
      KEY_DOWN_COMMAND,
      (event: KeyboardEvent) => {
        const { ctrlKey, metaKey, shiftKey, key } = event;
        const isModifier = ctrlKey || metaKey;
        
        // Ctrl/Cmd + Shift + C for code block
        if (isModifier && shiftKey && key === 'C') {
          event.preventDefault();
          editor.dispatchCommand(INSERT_CODE_BLOCK_COMMAND, '');
          return true;
        }
        
        return false;
      },
      COMMAND_PRIORITY_LOW
    );

    return () => {
      removeCodeHighlighting();
      removeCodeBlockCommand();
      removeKeyDownListener();
    };
  }, [editor]);

  return null;
}

// Custom plugin to handle link attributes
function CustomLinkPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const rootElement = editor.getRootElement();
    if (!rootElement) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const linkElement = target.closest('a[href]');
      
      if (linkElement) {
        event.preventDefault();
        event.stopPropagation();
        
        const href = linkElement.getAttribute('href');
        if (href) {
          // Handle both relative and absolute URLs
          let url = href;
          if (!href.startsWith('http://') && !href.startsWith('https://')) {
            url = href.startsWith('//') ? `https:${href}` : `https://${href}`;
          }
          
          window.open(url, '_blank', 'noopener,noreferrer');
        }
      }
    };

    rootElement.addEventListener('click', handleClick, true);

    return () => {
      rootElement.removeEventListener('click', handleClick, true);
    };
  }, [editor]);

  return null;
}

// Enhanced Math Plugin with proper node handling and commands
function EquationPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Register command listeners
    const removeInlineMathCommand = editor.registerCommand(
      INSERT_INLINE_MATH_COMMAND,
      (latex: string) => {
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const mathNode = $createEquationNode(latex, true);
            selection.insertNodes([mathNode]);
          }
        });
        return true;
      },
      COMMAND_PRIORITY_EDITOR
    );

    const removeBlockMathCommand = editor.registerCommand(
      INSERT_BLOCK_MATH_COMMAND,
      (latex: string) => {
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const mathNode = $createEquationNode(latex, false);
            selection.insertNodes([mathNode]);
          }
        });
        return true;
      },
      COMMAND_PRIORITY_EDITOR
    );

    const removeTransform = editor.registerNodeTransform(TextNode, (textNode) => {
      const text = textNode.getTextContent();
      
      // Match block math first: $$...$$ 
      const blockMathRegex = /\$\$([^$]+?)\$\$/g;
      // Match inline math: $...$ (but not $$)
      const inlineMathRegex = /(?<!\$)\$([^$\n]+?)\$(?!\$)/g;
      
      const replacements: Array<{ start: number; end: number; latex: string; isBlock: boolean }> = [];
      let match: RegExpExecArray | null;
      
      // Find block math first (higher priority)
      while ((match = blockMathRegex.exec(text)) !== null) {
        replacements.push({
          start: match.index,
          end: match.index + match[0].length,
          latex: match[1].trim(),
          isBlock: true
        });
      }
      
      // Find inline math, but skip if it overlaps with block math
      while ((match = inlineMathRegex.exec(text)) !== null) {
        const isOverlapping = replacements.some(r => 
          (match!.index >= r.start && match!.index < r.end) ||
          (match!.index + match![0].length > r.start && match!.index + match![0].length <= r.end)
        );
        if (!isOverlapping) {
          replacements.push({
            start: match.index,
            end: match.index + match[0].length,
            latex: match[1].trim(),
            isBlock: false
          });
        }
      }
      
      if (replacements.length > 0) {
        editor.update(() => {
          // Check if textNode still has a parent before proceeding
          if (!textNode.getParent()) {
            return;
          }
          
          // Sort by start position (descending) to replace from end to start
          replacements.sort((a, b) => b.start - a.start);
          
          replacements.forEach(({ start, end, latex, isBlock }) => {
            // Check if textNode is still valid and has a parent
            if (!textNode.getParent() || textNode.isAttached() === false) {
              return;
            }
            
            const beforeText = text.substring(0, start);
            const afterText = text.substring(end);
            
            // Create math node
            const mathNode = $createEquationNode(latex, !isBlock);
            
            // Handle text splitting
            if (beforeText && afterText) {
              // Split into three parts: before, math, after
              const beforeNode = $createTextNode(beforeText);
              const afterNode = $createTextNode(afterText);
              
              try {
                textNode.insertBefore(beforeNode);
                textNode.insertBefore(mathNode);
                textNode.replace(afterNode);
              } catch (error) {
                console.warn('Failed to replace text node with math nodes:', error);
              }
            } else if (beforeText) {
              // Only before text exists
              const beforeNode = $createTextNode(beforeText);
              try {
                textNode.insertBefore(beforeNode);
                textNode.replace(mathNode);
              } catch (error) {
                console.warn('Failed to replace text node with before text and math:', error);
              }
            } else if (afterText) {
              // Only after text exists
              const afterNode = $createTextNode(afterText);
              try {
                textNode.insertBefore(mathNode);
                textNode.replace(afterNode);
              } catch (error) {
                console.warn('Failed to replace text node with math and after text:', error);
              }
            } else {
              // Only math exists
              try {
                textNode.replace(mathNode);
              } catch (error) {
                console.warn('Failed to replace text node with math:', error);
              }
            }
          });
        });
      }
    });
    
    // Register keyboard shortcuts
    const removeKeyDownListener = editor.registerCommand(
      KEY_DOWN_COMMAND,
      (event: KeyboardEvent) => {
        const { ctrlKey, metaKey, shiftKey, key } = event;
        const isModifier = ctrlKey || metaKey;
        
        // Ctrl/Cmd + Shift + M for inline math
        if (isModifier && shiftKey && key === 'M') {
          event.preventDefault();
          editor.dispatchCommand(INSERT_INLINE_MATH_COMMAND, 'x = y');
          return true;
        }
        
        // Ctrl/Cmd + Alt + M for block math
        if (isModifier && event.altKey && key === 'M') {
          event.preventDefault();
          editor.dispatchCommand(INSERT_BLOCK_MATH_COMMAND, '\\sum_{i=1}^{n} x_i');
          return true;
        }
        
        return false;
      },
      COMMAND_PRIORITY_LOW
    );

    return () => {
      removeInlineMathCommand();
      removeBlockMathCommand();
      removeTransform();
      removeKeyDownListener();
    };
  }, [editor]);

  return null;
}

// Toolbar component



interface RichTextEditorProps {
  className?: string;
  streamingContent?: string;
  isStreaming?: boolean;
}

export function RichTextEditor({ className, streamingContent, isStreaming }: RichTextEditorProps) {
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
      EquationNode,
    ],
  };

  return (
    <div className={cn("flex flex-col h-full bg-background/30 backdrop-blur-sm", className)}>
       <LexicalComposer initialConfig={initialConfig}>
         <div className="relative flex-1 overflow-auto">
          <RichTextPlugin
            contentEditable={
              <ContentEditable 
                className="min-h-[400px] p-6 outline-none resize-none text-base leading-relaxed focus:outline-none text-foreground"
                style={{ caretColor: 'hsl(var(--foreground))' }}
              />
            }
            placeholder={
              <div className="absolute top-6 left-6 pointer-events-none text-base text-muted-foreground">
                Start editing your mind map content... Use $...$ for inline math or $$...$$ for block math
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <AutoFocusPlugin />
          <LinkPlugin 
          validateUrl={(url: string) => {
            // Always return true to allow all URLs
            return true;
          }}
        />
          <CustomLinkPlugin />
          <ListPlugin />
          <CodeHighlightPlugin />
          <EquationPlugin />
          <MarkdownShortcutPlugin transformers={ENHANCED_TRANSFORMERS} />
          <MarkdownSyncPlugin streamingContent={streamingContent} />
          <AutoScrollPlugin isStreaming={isStreaming || false} streamingContent={streamingContent} />
        </div>
      </LexicalComposer>
    </div>
  );
}