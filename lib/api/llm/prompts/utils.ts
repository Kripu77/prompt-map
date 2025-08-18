import type { MindmapMode, TopicShiftAnalysis, InfoType } from './types';
import { 
  THINKING_PROCESS_BASE,
  THINKING_PROCESS_EXTENSIONS,
  CURRENCY_KEYWORDS,
  WEB_SEARCH_TEMPLATES,
  COMMON_REQUIREMENTS,
  MODE_CONFIG
} from './constants';

export const getThinkingProcess = (mode: MindmapMode): string[] => {
  return [...THINKING_PROCESS_BASE, ...THINKING_PROCESS_EXTENSIONS[mode]];
};

export const formatDate = (customDate?: Date): string => {
  const date = customDate || new Date();
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long', 
    day: 'numeric'
  });
};

export const formatDateTime = (date: Date): string => {
  return date.toLocaleString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit', 
    minute: '2-digit', 
    timeZone: 'UTC',
    timeZoneName: 'short' 
  });
};

export const analyzeCurrency = (text: string): InfoType => {
  const lowerText = text.toLowerCase();
  const currentScore = Array.from(CURRENCY_KEYWORDS.current).filter(term => lowerText.includes(term)).length;
  const staticScore = Array.from(CURRENCY_KEYWORDS.static).filter(term => lowerText.includes(term)).length;
  
  if (currentScore > staticScore) return 'current';
  if (staticScore > currentScore) return 'static';
  return 'mixed';
};

export const getWebSearchGuidance = (infoType: InfoType): string => {
  return WEB_SEARCH_TEMPLATES[infoType];
};

export const generateRequirements = (mode: MindmapMode, additionalRequirements: string[] = []): string => {
  const modeConfig = MODE_CONFIG[mode];
  const requirements = [
    `- ${modeConfig.branches}`,
    `- ${modeConfig.subtopics}`,
    `- ${modeConfig.focus}`,
    `- ${modeConfig.format}`,
    ...additionalRequirements.map(req => `- ${req}`),
    ...COMMON_REQUIREMENTS.map(req => `- ${req}`)
  ];
  return requirements.join('\n');
};

// Advanced Error Handling and Edge Case Management
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export function validatePromptInput(input: string): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: []
  };

  // Check for empty or whitespace-only input
  if (!input || input.trim().length === 0) {
    result.isValid = false;
    result.errors.push('Input cannot be empty');
    result.suggestions.push('Please provide a topic or question for the mindmap');
    return result;
  }

  // Check for extremely short input
  if (input.trim().length < 3) {
    result.isValid = false;
    result.errors.push('Input is too short to generate meaningful content');
    result.suggestions.push('Please provide a more detailed topic or question');
  }

  // Check for extremely long input
  if (input.length > 2000) {
    result.warnings.push('Input is very long and may be truncated');
    result.suggestions.push('Consider breaking down your request into smaller, more focused topics');
  }

  // Check for potential spam or repetitive content
  const words = input.toLowerCase().split(/\s+/);
  const uniqueWords = new Set(words);
  if (words.length > 10 && uniqueWords.size / words.length < 0.3) {
    result.warnings.push('Input appears to be repetitive');
    result.suggestions.push('Try to use more varied vocabulary for better results');
  }

  // Check for common problematic patterns
  const problematicPatterns = [
    /^(test|testing|hello|hi)$/i,
    /^\d+$/,
    /^[^a-zA-Z]*$/
  ];

  for (const pattern of problematicPatterns) {
    if (pattern.test(input.trim())) {
      result.warnings.push('Input may not generate comprehensive mindmap content');
      result.suggestions.push('Try providing a more specific topic or research question');
      break;
    }
  }

  return result;
}

export function sanitizeInput(input: string): string {
  // Remove potentially harmful characters while preserving meaningful content
  return input
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
    .substring(0, 2000); // Limit length
}

export function handlePromptError(error: unknown, context: string): string {
  console.error(`Prompt error in ${context}:`, error);
  
  if (error instanceof Error) {
    // Handle specific error types
    if (error.message.includes('rate limit')) {
      return 'Rate limit exceeded. Please wait a moment before trying again.';
    }
    
    if (error.message.includes('timeout')) {
      return 'Request timed out. Please try again with a simpler topic.';
    }
    
    if (error.message.includes('content policy')) {
      return 'Content policy violation detected. Please rephrase your request.';
    }
    
    if (error.message.includes('token')) {
      return 'Request too long. Please try a more focused topic.';
    }
  }
  
  return 'An unexpected error occurred. Please try again or contact support if the issue persists.';
}

export function validateMindmapOutput(output: string): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: []
  };

  // Check for empty output
  if (!output || output.trim().length === 0) {
    result.isValid = false;
    result.errors.push('Generated mindmap is empty');
    return result;
  }

  // Check for minimum structure requirements
  const hasTitle = /^#\s+.+/m.test(output);
  const hasSubheadings = /^##\s+.+/m.test(output);
  const hasBulletPoints = /^\s*[-*]\s+.+/m.test(output);

  if (!hasTitle) {
    result.warnings.push('Mindmap lacks a clear title');
    result.suggestions.push('Consider adding a descriptive title with # syntax');
  }

  if (!hasSubheadings) {
    result.warnings.push('Mindmap lacks main sections');
    result.suggestions.push('Consider organizing content into main sections with ## syntax');
  }

  if (!hasBulletPoints) {
    result.warnings.push('Mindmap lacks detailed bullet points');
    result.suggestions.push('Consider adding specific details with bullet points');
  }

  // Check for balanced content
  const sections = output.split(/^##\s+/m).filter(section => section.trim().length > 0);
  if (sections.length > 1) {
    const sectionLengths = sections.map(section => section.length);
    const avgLength = sectionLengths.reduce((a, b) => a + b, 0) / sectionLengths.length;
    const imbalanced = sectionLengths.some(length => 
      Math.abs(length - avgLength) > avgLength * 0.7
    );
    
    if (imbalanced) {
      result.warnings.push('Mindmap sections appear unbalanced');
      result.suggestions.push('Consider balancing the depth of content across all sections');
    }
  }

  // Check for links
  const linkCount = (output.match(/\[.*?\]\(.*?\)/g) || []).length;
  if (linkCount === 0) {
    result.warnings.push('Mindmap contains no external links');
    result.suggestions.push('Consider adding relevant links to enhance the content');
  }

  return result;
}

export function recoverFromError(error: unknown, fallbackTopic: string): string {
  console.warn('Attempting error recovery for topic:', fallbackTopic);
  
  // Generate a basic mindmap structure as fallback
  return `# ${fallbackTopic}

## Overview
- This is a basic mindmap structure generated as a fallback
- The original request encountered an error and was simplified

## Key Areas
- Main concepts related to ${fallbackTopic}
- Important considerations and factors
- Related topics and connections

## Next Steps
- Research specific aspects in more detail
- Explore related topics and subtopics
- Gather additional information from reliable sources

*Note: This is a simplified version due to processing limitations. Please try rephrasing your request for better results.*`;
}

export const processTemplate = (template: string, variables: Record<string, string>): string => {
  return Object.entries(variables).reduce(
    (result, [key, value]) => result.replace(new RegExp(`{{${key}}}`, 'g'), value),
    template
  );
};

export const addChainOfThoughtPrompting = (prompt: string, mode: MindmapMode): string => {
  const thinkingSteps = getThinkingProcess(mode);
  const thinkingSection = `\n\n<reasoning>\nAnalyze:\n${thinkingSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}\n</reasoning>`;
  
  return prompt + thinkingSection;
};

export const analyzeTopicShift = (originalTopic: string, followUpQuestion: string): TopicShiftAnalysis => {
  // Enhanced semantic analysis with better keyword weighting
  const originalTerms = new Set(originalTopic.toLowerCase().split(/\s+/).filter(term => term.length > 2));
  const followUpTerms = new Set(followUpQuestion.toLowerCase().split(/\s+/).filter(term => term.length > 2));
  
  // Remove common stop words for better analysis
  const stopWords = new Set(['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use']);
  
  const filteredOriginal = new Set([...originalTerms].filter(term => !stopWords.has(term)));
  const filteredFollowUp = new Set([...followUpTerms].filter(term => !stopWords.has(term)));
  
  const intersection = new Set([...filteredOriginal].filter(x => filteredFollowUp.has(x)));
  const union = new Set([...filteredOriginal, ...filteredFollowUp]);
  
  const similarity = union.size > 0 ? intersection.size / union.size : 0;
  const confidence = Math.min(0.95, Math.abs(0.5 - similarity) * 2);
  
  // More nuanced threshold based on content length and context
  const avgLength = (originalTopic.length + followUpQuestion.length) / 2;
  const threshold = avgLength > 50 ? 0.25 : 0.35; // Lower threshold for longer content
  
  const isShift = similarity < threshold;
  
  const reason = isShift 
    ? `Low semantic similarity (${(similarity * 100).toFixed(1)}%) indicates topic shift`
    : `High semantic similarity (${(similarity * 100).toFixed(1)}%) suggests topic continuation`;
  
  let suggestedAction: 'continue' | 'new_topic' | 'clarify' = isShift ? 'new_topic' : 'continue';
  
  // Add clarification suggestion for ambiguous cases
  if (confidence < 0.6) {
    suggestedAction = 'clarify';
  }
  
  return { 
    isShift, 
    confidence, 
    reason,
    suggestedAction
  };
};