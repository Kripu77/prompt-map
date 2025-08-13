"use client";

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import { cn } from '@/lib/utils';

// Import highlight.js styles
import 'highlight.js/styles/github-dark.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={cn("prose max-w-none break-words overflow-wrap-anywhere", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={{
          // Custom styling for different elements to fit mindmap nodes
          h1: ({ children }) => (
            <h1 className="text-3xl font-bold mb-2 text-foreground">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-semibold mb-2 text-foreground">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-semibold mb-1 text-foreground">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-base font-medium mb-1 text-foreground">{children}</h4>
          ),
          h5: ({ children }) => (
            <h5 className="text-base font-medium mb-1 text-foreground">{children}</h5>
          ),
          h6: ({ children }) => (
            <h6 className="text-base font-medium mb-1 text-foreground">{children}</h6>
          ),
          p: ({ children }) => (
            <p className="text-3xl leading-relaxed mb-2 text-foreground break-words">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="text-3xl list-disc list-inside mb-2 space-y-1 text-foreground">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="text-3xl list-decimal list-inside mb-2 space-y-1 text-foreground">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-3xl text-foreground leading-relaxed">{children}</li>
          ),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          code: ({ className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            const inline = props.inline;
            
            if (inline) {
              return (
                <code 
                  className="bg-muted/70 px-1 py-0.5 rounded text-sm font-mono text-foreground" 
                  {...props}
                >
                  {children}
                </code>
              );
            }
            
            return (
              <div className="bg-muted/50 rounded p-2 my-1 overflow-x-auto">
                {language && (
                  <div className="text-muted-foreground text-sm mb-1 font-medium">
                    {language}
                  </div>
                )}
                <pre className="text-sm font-mono text-foreground overflow-x-auto">
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              </div>
            );
          },
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-muted-foreground/30 pl-2 my-1 text-sm italic text-muted-foreground">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-1">
              <table className="w-full border-collapse text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-muted/30">{children}</thead>
          ),
          tbody: ({ children }) => (
            <tbody>{children}</tbody>
          ),
          tr: ({ children }) => (
            <tr className="border-b border-border/50">{children}</tr>
          ),
          th: ({ children }) => (
            <th className="border border-border px-1 py-0.5 text-left font-medium text-foreground">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-border px-1 py-0.5 text-foreground">
              {children}
            </td>
          ),
          a: ({ href, children }) => (
            <a 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-500 hover:text-blue-600 underline text-sm"
            >
              {children}
            </a>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-foreground">{children}</em>
          ),
          hr: () => (
            <hr className="border-t border-border my-2" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}