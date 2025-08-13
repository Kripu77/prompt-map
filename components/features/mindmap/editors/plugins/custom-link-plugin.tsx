"use client";

import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $createTextNode,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  COMMAND_PRIORITY_HIGH,
  KEY_DOWN_COMMAND,
  CLICK_COMMAND,
  $getNearestNodeFromDOMNode,
  TextNode,
} from 'lexical';
import { $createLinkNode, $isLinkNode } from '@lexical/link';

export function CustomLinkPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const removeTransform = editor.registerNodeTransform(
      TextNode,
      (node) => {
        const textContent = node.getTextContent();
        
        // Auto-detect URLs and convert to links
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const matches = Array.from(textContent.matchAll(urlRegex));
        
        if (matches.length > 0) {
          let lastIndex = 0;
          const newNodes: ReturnType<typeof $createTextNode | typeof $createLinkNode>[] = [];
          
          matches.forEach((match) => {
            const url = match[0];
            const startIndex = match.index!;
            const endIndex = startIndex + url.length;
            
            // Add text before the URL
            if (startIndex > lastIndex) {
              const beforeText = textContent.slice(lastIndex, startIndex);
              if (beforeText) {
                newNodes.push($createTextNode(beforeText));
              }
            }
            
            // Add the link node
            const linkNode = $createLinkNode(url);
            linkNode.append($createTextNode(url));
            newNodes.push(linkNode);
            
            lastIndex = endIndex;
          });
          
          // Add remaining text after the last URL
          if (lastIndex < textContent.length) {
            const afterText = textContent.slice(lastIndex);
            if (afterText) {
              newNodes.push($createTextNode(afterText));
            }
          }
          
          if (newNodes.length > 0) {
            node.replace(newNodes[0]);
            for (let i = 1; i < newNodes.length; i++) {
              newNodes[0].insertAfter(newNodes[i]);
            }
          }
        }
      }
    );

    return removeTransform;
  }, [editor]);

  // Handle keyboard shortcuts for links
  useEffect(() => {
    return editor.registerCommand(
      KEY_DOWN_COMMAND,
      (event: KeyboardEvent) => {
        if (event.ctrlKey && event.key === 'k') {
          event.preventDefault();
          
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const selectedText = selection.getTextContent();
            const url = prompt('Enter URL:', 'https://');
            
            if (url) {
              const linkNode = $createLinkNode(url);
              linkNode.append($createTextNode(selectedText || url));
              selection.insertNodes([linkNode]);
            }
          }
          
          return true;
        }
        return false;
      },
      COMMAND_PRIORITY_HIGH,
    );
  }, [editor]);

  // Handle link clicks
  useEffect(() => {
    return editor.registerCommand(
      CLICK_COMMAND,
      (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        
        // Check if the clicked element is a link
        if (target.tagName === 'A' && target.getAttribute('href')) {
          event.preventDefault();
          const url = target.getAttribute('href');
          if (url) {
            window.open(url, '_blank', 'noopener,noreferrer');
          }
          return true;
        }
        
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );
  }, [editor]);

  return null;
}