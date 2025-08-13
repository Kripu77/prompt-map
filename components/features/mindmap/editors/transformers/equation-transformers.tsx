"use client";

import { TRANSFORMERS, TextMatchTransformer } from '@lexical/markdown';
import { LexicalNode } from 'lexical';
import { EquationNode, $createEquationNode, $isEquationNode } from '../nodes/equation-node';

// Equation transformers for markdown conversion
export const EQUATION_TRANSFORMERS: Array<TextMatchTransformer> = [
  // Block math: $$...$$
  {
    dependencies: [EquationNode],
    export: (node: LexicalNode) => {
      if (!$isEquationNode(node)) {
        return null;
      }
      const equation = node.__equation;
      return node.__inline ? null : `$$${equation}$$`;
    },
    importRegExp: /\$\$([^$]+?)\$\$/,
    regExp: /\$\$([^$]+?)\$\$/,
    replace: (textNode, match) => {
      const [, equation] = match;
      const equationNode = $createEquationNode(equation, false);
      textNode.replace(equationNode);
    },
    trigger: '$',
    type: 'text-match',
  },
  // Inline math: $...$
  {
    dependencies: [EquationNode],
    export: (node: LexicalNode) => {
      if (!$isEquationNode(node)) {
        return null;
      }
      const equation = node.__equation;
      return node.__inline ? `$${equation}$` : null;
    },
    importRegExp: /(?<!\$)\$([^$\n]+?)\$(?!\$)/,
    regExp: /(?<!\$)\$([^$\n]+?)\$(?!\$)/,
    replace: (textNode, match) => {
      const [, equation] = match;
      const equationNode = $createEquationNode(equation, true);
      textNode.replace(equationNode);
    },
    trigger: '$',
    type: 'text-match',
  },
];

// Enhanced transformers including equations
export const ENHANCED_TRANSFORMERS = [...TRANSFORMERS, ...EQUATION_TRANSFORMERS];