import type { CoreMessage } from "ai";
import type { MindmapMode, DateTimeConfig, TopicShiftAnalysis } from './types';
import { 
  createMessages,
  createFollowUpMessages,
  createTopicShiftMessages
} from './templates';
import { analyzeTopicShift } from './utils';

export class MindmapPromptOrchestrator {
  createInitialPrompt(
    topic: string, 
    mode: MindmapMode = 'comprehensive', 
    config?: DateTimeConfig
  ): CoreMessage[] {
    if (!topic?.trim()) {
      return this.createErrorPrompt('Topic cannot be empty');
    }
    return createMessages(topic, mode, config);
  }

  createFollowUpPrompt(
    originalPrompt: string,
    currentMindmap: string,
    followUpQuestion: string,
    previousPrompts: string[],
    mode: MindmapMode = 'comprehensive',
    config?: DateTimeConfig
  ): CoreMessage[] {
    return createFollowUpMessages(
      originalPrompt,
      followUpQuestion,
      mode,
      config
    );
  }

  createTopicShiftPrompt(
    currentTopic: string,
    originalPrompt: string,
    followUpQuestion: string
  ): CoreMessage[] {
    return createTopicShiftMessages(
      currentTopic,
      originalPrompt,
      followUpQuestion
    );
  }

  createNewTopicPrompt(
    originalTopic: string,
    newQuestion: string,
    mode: MindmapMode = 'comprehensive',
    config?: DateTimeConfig
  ): CoreMessage[] {
    return this.createInitialPrompt(newQuestion, mode, config);
  }

  createClarificationPrompt(topic: string): CoreMessage[] {
    return [
      {
        role: 'system',
        content: 'You help clarify ambiguous topics for mindmap creation.'
      },
      {
        role: 'user',
        content: `The topic "${topic}" needs clarification. What specific aspect would you like to explore?`
      }
    ];
  }

  createFallbackPrompt(topic: string, mode: MindmapMode = 'comprehensive'): CoreMessage[] {
    return this.createInitialPrompt(`General overview of ${topic}`, mode);
  }

  analyzeTopicShift(currentTopic: string, followUpQuestion: string): TopicShiftAnalysis {
    return analyzeTopicShift(currentTopic, followUpQuestion);
  }

  private createErrorPrompt(reason: string): CoreMessage[] {
    return [
      {
        role: 'system',
        content: 'You provide helpful error messages and suggestions.'
      },
      {
        role: 'user',
        content: `Error: ${reason}. Please provide a valid topic for mindmap creation.`
      }
    ];
  }
}

export class OrchestratorFactory {
  static createDefault(): MindmapPromptOrchestrator {
    return new MindmapPromptOrchestrator();
  }
}