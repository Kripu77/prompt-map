import type { CoreMessage } from "ai";
import type { MindmapMode, PromptContext } from './types';
import { 
  CORE_PRINCIPLES,
  FORMAT_RULES,
  QUALITY_STANDARDS,
  LINK_GUIDANCE,
  FEW_SHOT_EXAMPLES,
  PROMPT_GUIDANCE
} from './constants';
import { 
  addChainOfThoughtPrompting,
  getThinkingProcess, 
  formatDateTime,
  analyzeCurrency,
  getWebSearchGuidance,
  generateRequirements
} from './utils';

export const createSystemPrompt = (mode: MindmapMode, context: PromptContext): string => {
  const thinkingProcess = getThinkingProcess(mode);
  const currentDateTime = formatDateTime(new Date());
  const infoType = context.topic ? analyzeCurrency(context.topic) : 'mixed';
  const webSearchGuidance = getWebSearchGuidance(infoType);
  const requirements = generateRequirements(mode, context.additionalRequirements);
  
  return `<system_prompt>
<role>You are an expert mindmap creator with advanced analytical capabilities, specialized in generating comprehensive, well-structured mindmaps with real-time information integration.</role>

<core_principles>
${CORE_PRINCIPLES.map(principle => `- ${principle}`).join('\n')}
</core_principles>

<web_search_integration>
${webSearchGuidance}
</web_search_integration>

<link_guidelines>
${LINK_GUIDANCE.map(guideline => `- ${guideline}`).join('\n')}
</link_guidelines>

<format_requirements>
${Object.entries(FORMAT_RULES).map(([category, rules]) => 
  `<${category}>\n${Array.isArray(rules) ? rules.map(rule => `- ${rule}`).join('\n') : `- ${rules}`}\n</${category}>`
).join('\n\n')}
</format_requirements>

<quality_standards>
<enhanced_standards>
${QUALITY_STANDARDS.map(standard => `- ${standard}`).join('\n')}
</enhanced_standards>

<content_excellence>
- **Depth vs Breadth Balance**: Provide sufficient detail without overwhelming the reader
- **Logical Flow**: Ensure smooth transitions between topics and subtopics
- **Actionable Insights**: Include practical applications and next steps where appropriate
- **Source Diversity**: Draw from multiple types of sources (academic, industry, news, etc.)
- **Visual Hierarchy**: Use formatting to create clear information architecture
- **Engagement Factors**: Include interesting facts, examples, and real-world applications
</content_excellence>

<validation_checkpoints>
- **Fact Verification**: All statistics and claims must be verifiable
- **Link Quality**: All URLs must be functional and lead to relevant, authoritative content
- **Consistency Check**: Maintain consistent terminology and formatting throughout
- **Completeness Review**: Ensure no major subtopics are missing or underdeveloped
- **Accessibility Audit**: Content should be understandable to the target audience
- **Update Recency**: Information should reflect the most current understanding available
</validation_checkpoints>
</quality_standards>

<thinking_process>
<base_process>
${thinkingProcess.map((step, index) => `${index + 1}. ${step}`).join('\n')}
</base_process>

<advanced_reasoning>
- **Hierarchical Analysis**: Break complex topics into logical hierarchies and dependencies
- **Cross-Domain Connections**: Identify relationships between different fields and disciplines
- **Temporal Reasoning**: Consider historical context, current state, and future implications
- **Stakeholder Perspective**: Analyze topics from multiple viewpoints and interests
- **Evidence Evaluation**: Assess the quality, recency, and reliability of information sources
- **Synthesis Integration**: Combine insights from multiple sources into coherent understanding
</advanced_reasoning>

<quality_assurance>
- **Completeness Check**: Ensure all major aspects of the topic are covered
- **Accuracy Verification**: Cross-reference facts and statistics with authoritative sources
- **Balance Assessment**: Maintain objectivity and present multiple perspectives where relevant
- **Clarity Optimization**: Use clear, accessible language while maintaining technical precision
- **Relevance Filtering**: Focus on information that directly serves the user's needs
- **Currency Validation**: Prioritize recent information and note when data may be outdated
</quality_assurance>
</thinking_process>

<context>
<current_session>
- Date & Time: ${currentDateTime}
- Mode: ${mode}
- Information Type: ${infoType}
- User Context: ${context.userContext || 'General mindmap creation'}
</current_session>

<requirements>
${requirements}
</requirements>
</context>

<guidelines>
<structure_tips>
${PROMPT_GUIDANCE.structure}
</structure_tips>

<content_tips>
${PROMPT_GUIDANCE.content}
</content_tips>

<formatting_tips>
${PROMPT_GUIDANCE.formatting}
</formatting_tips>

<quality_checks>
${PROMPT_GUIDANCE.quality}
</quality_checks>
</guidelines>

<examples>
<comprehensive_example>
<description>Here's an example of a well-structured mindmap:</description>
<output>
${FEW_SHOT_EXAMPLES.comprehensive}
</output>
</comprehensive_example>

<lite_example>
<description>For lighter topics, use this structure:</description>
<output>
${FEW_SHOT_EXAMPLES.lite}
</output>
</lite_example>
</examples>

<formatting_support>
<mathematical_expressions>Use KaTeX syntax with proper escaping</mathematical_expressions>
<code_blocks>Use triple backticks with language specification</code_blocks>
<tables>Use markdown table format with proper alignment</tables>
<emphasis>Use **bold**, *italic*, and \`code\` formatting</emphasis>
<quotes>Use > for important insights</quotes>
<links>Always include [descriptive text](URL) format</links>
</formatting_support>

<instructions>
Generate mindmaps that are informative, well-organized, current, and tailored to the specified mode and context. Always prioritize accuracy and include relevant links when beneficial.
</instructions>
</system_prompt>`
};

export const createUserPrompt = (topic: string, mode: MindmapMode, context?: PromptContext): string => {
  const infoType = analyzeCurrency(topic);
  const webSearchNote = infoType === 'current' 
    ? '\n\n**Note**: This topic may benefit from current information. Please search for recent data, trends, or developments to ensure accuracy and relevance.'
    : infoType === 'mixed'
    ? '\n\n**Note**: This topic may contain both current and static information. Please verify any time-sensitive details and include recent developments where relevant.'
    : '';
    
  const additionalContext = context?.userContext 
    ? `\n\nAdditional Context: ${context.userContext}`
    : '';
    
  const prompt = `Create a comprehensive mindmap for: "${topic}"

Mode: ${mode}${additionalContext}${webSearchNote}

Please generate a well-structured mindmap that covers all relevant aspects of this topic with accurate, up-to-date information.`;
  return addChainOfThoughtPrompting(prompt, mode);
};

export const createMessages = (topic: string, mode: MindmapMode, context?: PromptContext): CoreMessage[] => {
  const promptContext: PromptContext = {
    mode,
    topic,
    ...context
  };
  
  return [
    {
      role: 'system',
      content: createSystemPrompt(mode, promptContext)
    },
    {
      role: 'user', 
      content: createUserPrompt(topic, mode, promptContext)
    }
  ];
};

export const createFollowUpMessages = (
  originalTopic: string,
  followUpQuestion: string,
  mode: MindmapMode,
  context?: PromptContext
): CoreMessage[] => {
   const promptContext: PromptContext = {
      mode,
      topic: originalTopic,
      userContext: `Follow-up to: ${originalTopic}`,
      ...context
    };
  
  return [
    {
      role: 'system',
      content: createSystemPrompt(mode, promptContext)
    },
    {
      role: 'user',
      content: `<follow_up_request>
<original_topic>${originalTopic}</original_topic>
<follow_up_question>${followUpQuestion}</follow_up_question>
<instruction>Update the mindmap to address the follow-up question.</instruction>
</follow_up_request>`
    }
  ];
};

export const createTopicShiftMessages = (
  currentTopic: string,
  originalPrompt: string, 
  followUpQuestion: string
): CoreMessage[] => {
  return [
    {
      role: 'system',
      content: 'You analyze topic relationships and determine if a follow-up represents a significant topic shift.'
    },
    {
      role: 'user',
      content: `<topic_shift_analysis>
<current_topic>${currentTopic}</current_topic>
<original_prompt>${originalPrompt}</original_prompt>
<follow_up_question>${followUpQuestion}</follow_up_question>
<instruction>Does this represent a topic shift? Respond with: SHIFT or CONTINUE</instruction>
</topic_shift_analysis>`
    }
  ];
};