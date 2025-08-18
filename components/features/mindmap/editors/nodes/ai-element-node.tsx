"use client";

import React from 'react';
import { DecoratorNode, NodeKey, LexicalNode, SerializedLexicalNode, Spread } from 'lexical';
import { ReactNode } from 'react';
import { Tool, ToolHeader, ToolContent, ToolInput, ToolOutput } from '@/components/ai-elements/tool';
import { Task, TaskTrigger, TaskContent, TaskItem } from '@/components/ai-elements/task';
import { Sources, SourcesTrigger, SourcesContent, Source } from '@/components/ai-elements/source';

export type ToolUIPart = {
  toolName: string;
  state: 'pending' | 'running' | 'completed' | 'error';
  input: any;
  output?: any;
  errorText?: string;
};

export type TaskItem = {
  id: string;
  content: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
};

export type SourceItem = {
  title?: string;
  url: string;
  description?: string;
};

export type AIElementType = 'tool' | 'task' | 'source';

export type AIElementData = {
  toolUIParts?: ToolUIPart[];
  tasks?: TaskItem[];
  sources?: SourceItem[];
};

export type SerializedAIElementNode = Spread<
  {
    elementType: AIElementType;
    data: AIElementData;
  },
  SerializedLexicalNode
>;

export class AIElementNode extends DecoratorNode<ReactNode> {
  __elementType: AIElementType;
  __data: AIElementData;

  static getType(): string {
    return 'ai-element';
  }

  static clone(node: AIElementNode): AIElementNode {
    return new AIElementNode(node.__elementType, node.__data, node.__key);
  }

  constructor(elementType: AIElementType, data: AIElementData, key?: NodeKey) {
    super(key);
    this.__elementType = elementType;
    this.__data = data;
  }

  createDOM(): HTMLElement {
    const div = document.createElement('div');
    div.className = 'ai-element-node';
    return div;
  }

  updateDOM(): false {
    return false;
  }

  static importJSON(serializedNode: SerializedAIElementNode): AIElementNode {
    const { elementType, data } = serializedNode;
    return $createAIElementNode(elementType, data);
  }

  exportJSON(): SerializedAIElementNode {
    return {
      elementType: this.__elementType,
      data: this.__data,
      type: 'ai-element',
      version: 1,
    };
  }

  getElementType(): AIElementType {
    return this.__elementType;
  }

  getData(): AIElementData {
    return this.__data;
  }

  setData(data: AIElementData): void {
    const writable = this.getWritable();
    writable.__data = data;
  }

  decorate(): ReactNode {
    const { __elementType, __data } = this;

    switch (__elementType) {
      case 'tool':
        return (
          <div className="ai-element-tool my-4">
            {__data.toolUIParts?.map((toolPart, index) => (
              <Tool key={index}>
                <ToolHeader 
                  type={toolPart.toolName} 
                  state={toolPart.state === 'pending' ? 'input-streaming' : 
                         toolPart.state === 'running' ? 'input-available' :
                         toolPart.state === 'error' ? 'output-error' : 'output-available'} 
                />
                <ToolContent>
                  <ToolInput input={toolPart.input} />
                  {(toolPart.output || toolPart.errorText) && (
                    <ToolOutput output={toolPart.output} errorText={toolPart.errorText} />
                  )}
                </ToolContent>
              </Tool>
            ))}
          </div>
        );

      case 'task':
        return (
          <div className="ai-element-task my-4">
            <Task>
              <TaskTrigger title={`Tasks (${__data.tasks?.length || 0})`} />
              <TaskContent>
                {__data.tasks?.map((task) => (
                  <TaskItem key={task.id}>
                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                      task.status === 'completed' ? 'bg-green-500' :
                      task.status === 'in_progress' ? 'bg-yellow-500' : 'bg-gray-400'
                    }`} />
                    {task.content}
                  </TaskItem>
                ))}
              </TaskContent>
            </Task>
          </div>
        );

      case 'source':
        return (
          <div className="ai-element-source my-4">
            <Sources>
              <SourcesTrigger count={__data.sources?.length || 0} />
              <SourcesContent>
                {__data.sources?.map((source, index) => (
                  <Source key={index} href={source.url} title={source.title || source.url}>
                    {source.title && <span>{source.title}</span>}
                    {source.description && <span className="text-xs text-muted-foreground block">{source.description}</span>}
                  </Source>
                ))}
              </SourcesContent>
            </Sources>
          </div>
        );

      default:
        return null;
    }
  }
}



export function $createAIElementNode(elementType: AIElementType, data: AIElementData): AIElementNode {
  return new AIElementNode(elementType, data);
}

export function $isAIElementNode(node: LexicalNode | null | undefined): node is AIElementNode {
  return node instanceof AIElementNode;
}