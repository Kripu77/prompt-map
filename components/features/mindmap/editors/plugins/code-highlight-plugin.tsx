"use client";

import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { registerCodeHighlighting } from '@lexical/code';
import {
  $createTextNode,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_EDITOR,
  KEY_DOWN_COMMAND,
  COMMAND_PRIORITY_LOW,
  TextNode,
} from 'lexical';
import { $createCodeNode } from '@lexical/code';
import { INSERT_CODE_BLOCK_COMMAND } from '../commands/editor-commands';

export function CodeHighlightPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return registerCodeHighlighting(editor);
  }, [editor]);

  useEffect(() => {
    return editor.registerCommand(
      INSERT_CODE_BLOCK_COMMAND,
      (language: string) => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const codeNode = $createCodeNode(language);
          const textNode = $createTextNode('// Your code here');
          codeNode.append(textNode);
          selection.insertNodes([codeNode]);
        }
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );
  }, [editor]);

  useEffect(() => {
    const removeTransform = editor.registerNodeTransform(
      TextNode,
      (node) => {
        const textContent = node.getTextContent();
          
          // Auto-detect code blocks with triple backticks
          if (textContent.includes('```')) {
            const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
            let match;
            
            while ((match = codeBlockRegex.exec(textContent)) !== null) {
              const [fullMatch, language, code] = match;
              const startIndex = match.index;
              const endIndex = startIndex + fullMatch.length;
              
              if (startIndex === 0 && endIndex === textContent.length) {
                // Replace entire text node with code block
                const codeNode = $createCodeNode(language || '');
                const codeTextNode = $createTextNode(code.trim());
                codeNode.append(codeTextNode);
                node.replace(codeNode);
                break;
              }
            }
          }
      }
    );

    return removeTransform;
  }, [editor]);

  // Handle keyboard shortcuts
  useEffect(() => {
    return editor.registerCommand(
      KEY_DOWN_COMMAND,
      (event: KeyboardEvent) => {
        if (event.ctrlKey && event.shiftKey && event.key === 'C') {
          event.preventDefault();
          editor.dispatchCommand(INSERT_CODE_BLOCK_COMMAND, '');
          return true;
        }
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );
  }, [editor]);

  return null;
}