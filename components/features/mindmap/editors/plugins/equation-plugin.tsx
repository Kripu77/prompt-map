"use client";

import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $createTextNode,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_EDITOR,
  KEY_DOWN_COMMAND,
  COMMAND_PRIORITY_LOW,
  TextNode,
} from 'lexical';
import { $createEquationNode } from '../nodes/equation-node';
import { INSERT_INLINE_MATH_COMMAND, INSERT_BLOCK_MATH_COMMAND } from '../commands/editor-commands';

export function EquationPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      INSERT_INLINE_MATH_COMMAND,
      (equation: string) => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const equationNode = $createEquationNode(equation, true);
          selection.insertNodes([equationNode]);
        }
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );
  }, [editor]);

  useEffect(() => {
    return editor.registerCommand(
      INSERT_BLOCK_MATH_COMMAND,
      (equation: string) => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const equationNode = $createEquationNode(equation, false);
          selection.insertNodes([equationNode]);
        }
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );
  }, [editor]);

  // Handle keyboard shortcuts
  useEffect(() => {
    return editor.registerCommand(
      KEY_DOWN_COMMAND,
      (event: KeyboardEvent) => {
        // Ctrl+Shift+M for inline math
        if (event.ctrlKey && event.shiftKey && event.key === 'M') {
          event.preventDefault();
          editor.dispatchCommand(INSERT_INLINE_MATH_COMMAND, 'x = y');
          return true;
        }
        
        // Ctrl+Alt+M for block math
        if (event.ctrlKey && event.altKey && event.key === 'M') {
          event.preventDefault();
          editor.dispatchCommand(INSERT_BLOCK_MATH_COMMAND, '\\sum_{i=1}^{n} x_i');
          return true;
        }
        
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );
  }, [editor]);

  // Auto-detect math expressions
  useEffect(() => {
    const removeTransform = editor.registerNodeTransform(
      TextNode,
      (node) => {
        const textContent = node.getTextContent();
          
          // Auto-detect block math $$...$$
          const blockMathRegex = /\$\$([^$]+?)\$\$/g;
          let match = blockMathRegex.exec(textContent);
          
          if (match) {
            const [fullMatch, equation] = match;
            const startIndex = match.index;
            const endIndex = startIndex + fullMatch.length;
            
            if (startIndex === 0 && endIndex === textContent.length) {
              // Replace entire text node with equation
              const equationNode = $createEquationNode(equation.trim(), false);
              node.replace(equationNode);
              return;
            }
          }
          
          // Auto-detect inline math $...$
          const inlineMathRegex = /(?<!\$)\$([^$\n]+?)\$(?!\$)/g;
          match = inlineMathRegex.exec(textContent);
          
          if (match) {
            const [fullMatch, equation] = match;
            const startIndex = match.index;
            const endIndex = startIndex + fullMatch.length;
            
            if (startIndex === 0 && endIndex === textContent.length) {
              // Replace entire text node with equation
              const equationNode = $createEquationNode(equation.trim(), true);
              node.replace(equationNode);
              return;
            }
          }
      }
    );

    return removeTransform;
  }, [editor]);

  return null;
}