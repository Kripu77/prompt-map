import type { CoreMessage } from "ai";

export type MindmapMode = 'lite' | 'comprehensive';
export type InfoType = 'current' | 'static' | 'mixed';

export interface PromptContext {
  userExpertise?: string;
  purpose?: string;
  timeConstraint?: string;
  format?: string;
  mode?: MindmapMode;
  timestamp?: string;
  sessionId?: string;
  topic?: string;
  userContext?: string;
  additionalRequirements?: string[];
}

export interface TopicShiftAnalysis {
  isShift: boolean;
  confidence: number;
  reason: string;
  suggestedAction: 'continue' | 'new_topic' | 'clarify';
}

export interface PromptTemplate {
  id: string;
  name: string;
  template: string;
  requiredVariables: string[];
  optionalVariables?: Record<string, string | number | boolean>;
}

export interface DateTimeConfig {
  customDate?: Date;
  includeTime?: boolean;
  timezone?: string;
  format?: 'short' | 'long' | 'iso';
}

export interface PromptBuilder {
  withTemplate(template: PromptTemplate): PromptBuilder;
  withContext(context: PromptContext): PromptBuilder;
  withDateTime(config: DateTimeConfig): PromptBuilder;
  withVariables(variables: Record<string, string | number | boolean>): PromptBuilder;
  build(): CoreMessage[];
}

export interface WebSearchConfig {
  enabled: boolean;
  maxResults?: number;
  queryModifiers?: string[];
  domainFilters?: {
    include?: string[];
    exclude?: string[];
  };
}

export interface QualityMetrics {
  clarity: number;
  completeness: number;
  relevance: number;
  overall: number;
  feedback: string[];
}