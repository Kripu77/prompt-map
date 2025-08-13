"use client";

import { ReactNode } from 'react';
import {
  DecoratorNode,
  NodeKey,
  LexicalNode,
  SerializedLexicalNode,
  Spread,
} from 'lexical';
import katex from 'katex';
import 'katex/dist/katex.min.css';

type SerializedEquationNode = Spread<
  {
    equation: string;
    inline: boolean;
  },
  SerializedLexicalNode
>;

export class EquationNode extends DecoratorNode<ReactNode> {
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
    element.className = this.__inline ? 'equation-inline' : 'equation-block';
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
    const equation = this.__equation;
    const inline = this.__inline;

    try {
      const html = katex.renderToString(equation, {
        displayMode: !inline,
        throwOnError: false,
        output: 'html',
        strict: false,
        trust: false,
        macros: {
          '\\f': '#1f(#2)',
        },
      });

      return (
        <span
          className={inline ? 'equation-inline' : 'equation-block'}
          dangerouslySetInnerHTML={{ __html: html }}
          onClick={(e) => {
            e.preventDefault();
            // Could add edit functionality here
          }}
          style={{
            cursor: 'pointer',
            padding: inline ? '2px 4px' : '8px',
            margin: inline ? '0 2px' : '8px 0',
            borderRadius: '4px',
            backgroundColor: 'transparent',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        />
      );
    } catch (error) {
      return (
        <span className="equation-error">
          Error: {equation}
        </span>
      );
    }
  }
}

export function $createEquationNode(equation: string, inline: boolean): EquationNode {
  return new EquationNode(equation, inline);
}

export function $isEquationNode(node: LexicalNode | null | undefined): node is EquationNode {
  return node instanceof EquationNode;
}