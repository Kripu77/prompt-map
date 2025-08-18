"use client";

import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $createParagraphNode, $getRoot, $insertNodes } from 'lexical';
import { $createAIElementNode, AIElementNode, type ToolUIPart, type TaskItem, type SourceItem } from '../nodes/ai-element-node';
import { Tool, ToolHeader, ToolContent, ToolInput, ToolOutput } from '@/components/ai-elements/tool';
import { Task, TaskTrigger, TaskContent, TaskItem as TaskItemComponent } from '@/components/ai-elements/task';
import { Sources, SourcesTrigger, SourcesContent, Source } from '@/components/ai-elements/source';

interface AIElementsPluginProps {
  toolCalls?: Array<{
    id: string;
    type: string;
    state: 'pending' | 'running' | 'completed' | 'error';
    input: any;
    output?: any;
    errorText?: string;
  }>;
  tasks?: TaskItem[];
  sources?: SourceItem[];
  isStreaming?: boolean;
}

export function AIElementsPlugin({ 
  toolCalls = [], 
  tasks = [], 
  sources = [], 
  isStreaming = false 
}: AIElementsPluginProps) {
  const [editor] = useLexicalComposerContext();

  // Convert tool calls to ToolUIPart format
  const toolUIParts: ToolUIPart[] = toolCalls.map(toolCall => ({
    toolName: toolCall.type,
    state: toolCall.state,
    input: toolCall.input,
    output: toolCall.output,
    errorText: toolCall.errorText
  }));

  // Insert AI elements into the editor when they change
  useEffect(() => {
    if (!isStreaming && (toolUIParts.length > 0 || tasks.length > 0 || sources.length > 0)) {
      editor.update(() => {
        const root = $getRoot();
        
        // Find existing AI element nodes and remove them
        const existingAINodes = root.getChildren().filter(child => child instanceof AIElementNode);
        existingAINodes.forEach(node => node.remove());
        
        // Create new AI element nodes
        const aiElements = [];
        
        // Add tool calls
        if (toolUIParts.length > 0) {
          const toolNode = $createAIElementNode('tool', { toolUIParts });
          aiElements.push(toolNode);
        }
        
        // Add tasks
        if (tasks.length > 0) {
          const taskNode = $createAIElementNode('task', { tasks });
          aiElements.push(taskNode);
        }
        
        // Add sources
        if (sources.length > 0) {
          const sourceNode = $createAIElementNode('source', { sources });
          aiElements.push(sourceNode);
        }
        
        // Insert AI elements at the end of the document
        if (aiElements.length > 0) {
          // Add a separator paragraph
          const separatorNode = $createParagraphNode();
          separatorNode.append();
          
          // Insert all AI elements
          $insertNodes([separatorNode, ...aiElements]);
        }
      });
    }
  }, [editor, toolUIParts, tasks, sources, isStreaming]);

  return null;
}

// Standalone components for rendering AI elements outside the editor
export function AIElementsRenderer({ 
  toolCalls = [], 
  tasks = [], 
  sources = [] 
}: Omit<AIElementsPluginProps, 'isStreaming'>) {
  const toolUIParts: ToolUIPart[] = toolCalls.map(toolCall => ({
    toolName: toolCall.type,
    state: toolCall.state,
    input: toolCall.input,
    output: toolCall.output,
    errorText: toolCall.errorText
  }));

  return (
    <div className="ai-elements-container space-y-4 mt-4">
      {toolUIParts.length > 0 && (
        <div className="tool-calls">
          {toolUIParts.map((toolPart, index) => (
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
      )}
      
      {tasks.length > 0 && (
        <div className="tasks">
          <Task>
            <TaskTrigger title={`Tasks (${tasks.length})`} />
            <TaskContent>
              {tasks.map((task) => (
                <TaskItemComponent key={task.id}>
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                    task.status === 'completed' ? 'bg-green-500' :
                    task.status === 'in_progress' ? 'bg-yellow-500' : 'bg-gray-400'
                  }`} />
                  {task.content}
                </TaskItemComponent>
              ))}
            </TaskContent>
          </Task>
        </div>
      )}
      
      {sources.length > 0 && (
        <div className="sources">
          <Sources>
            <SourcesTrigger count={sources.length} />
            <SourcesContent>
              {sources.map((source, index) => (
                <Source key={index} href={source.url} title={source.title || source.url}>
                  {source.title && <span>{source.title}</span>}
                  {source.description && <span className="text-xs text-muted-foreground block">{source.description}</span>}
                </Source>
              ))}
            </SourcesContent>
          </Sources>
        </div>
      )}
    </div>
  );
}