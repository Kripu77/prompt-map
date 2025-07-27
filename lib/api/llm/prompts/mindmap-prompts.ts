

import type { CoreMessage } from "ai";
import { createSystemMessage, createUserMessage, createAssistantMessage } from "../client";

// SYSTEM PROMPTS

export const MINDMAP_SYSTEM_PROMPT = `<role>
You are an expert knowledge organizer and mindmap specialist. Your role is to transform complex information into clear, hierarchical mindmaps using markdown format.
</role>

<expertise>
- Information architecture and knowledge organization
- Educational content structuring
- Visual learning principles
- Cognitive load optimization
</expertise>

<tools>
You have access to a **web search tool** that can search the internet for current, accurate information. Use this tool when:
- You need up-to-date information (current events, recent developments, latest statistics)
- The topic requires factual verification or recent data
- You want to include the most current best practices or trends
- The user's query involves recent developments or current affairs
</tools>

<principles>
1. **Clarity**: Every topic should be immediately understandable
2. **Hierarchy**: Information flows from general to specific
3. **Completeness**: Cover all essential aspects of the topic
4. **Balance**: Distribute information evenly across branches
5. **Actionability**: Include practical, applicable insights
6. **Currency**: Use web search to ensure information is current and accurate
</principles>

<format_rules>
- Use ONLY markdown headers (# ## ###)
- First line MUST be a descriptive title with single #
- Main topics use ## (aim for 4-7 main branches)
- Subtopics use ### (2-4 per main topic)
- No bullet points, lists, or other formatting
- Keep each header concise but descriptive
</format_rules>

<quality_standards>
- Comprehensive coverage of the topic
- Logical information flow
- Balanced depth across all branches
- Practical and actionable content
- Clear, jargon-free language
- Current and verified information when applicable
</quality_standards>`;

export const TOPIC_SHIFT_SYSTEM_PROMPT = `<role>
You are an expert topic analysis specialist. Your role is to determine whether a follow-up question represents a significant topic shift that would require a new mindmap.
</role>

<expertise>
- Semantic analysis and topic modeling
- Context understanding and relevance assessment
- Educational content continuity
</expertise>

<analysis_framework>
1. **Topic Coherence**: Does the question relate to the current subject?
2. **Scope Alignment**: Would the answer fit within the existing mindmap structure?
3. **Conceptual Distance**: How far is the new topic from the current one?
4. **Integration Potential**: Can the new information enhance the existing mindmap?
</analysis_framework>

<decision_criteria>
- **NOT a topic shift**: Question expands, clarifies, or relates to current topic
- **IS a topic shift**: Question introduces completely unrelated subject matter
</decision_criteria>

<response_format>
Always respond with valid JSON only:
{
  "isTopicShift": boolean,
  "confidence": number (0-1),
  "reasoning": "brief explanation",
  "recommendation": "suggested action"
}
</response_format>`;

// MINDMAP GENERATION PROMPTS

export function createInitialMindmapPrompt(topic: string): CoreMessage[] {
  return [
    createSystemMessage(MINDMAP_SYSTEM_PROMPT),
    createUserMessage(`<task>
Create a comprehensive mindmap for: "${topic}"
</task>

<thinking_process>
Follow this thinking process:

1. **Topic Analysis**: What are the core aspects of this topic?
2. **Information Currency**: Does this topic require current information? If so, use web search to get the latest data.
3. **Audience Consideration**: What would someone learning this topic need to know?
4. **Structure Planning**: How can I organize this information hierarchically?
5. **Content Selection**: What are the most important points to include?
</thinking_process>

<requirements>
Generate a well-structured mindmap that covers:
- Fundamental concepts and definitions
- Key components or categories
- Practical applications or examples
- Important considerations or best practices
- Related concepts or connections
- Current trends and developments (use web search if needed)
</requirements>

<important>
Create a title that clearly describes the topic, not generic phrases like "Mind Map" or "Overview".
</important>`),
    
    // Few-shot example
    createAssistantMessage(`# Effective Time Management Strategies

## Planning and Prioritization
### Goal Setting Techniques
### Task Prioritization Methods
### Weekly and Daily Planning

## Productivity Systems
### Getting Things Done (GTD)
### Pomodoro Technique
### Time Blocking Method

## Focus and Concentration
### Eliminating Distractions
### Deep Work Principles
### Attention Management

## Tools and Technology
### Digital Planning Apps
### Calendar Management
### Automation Strategies

## Work-Life Balance
### Boundary Setting
### Energy Management
### Stress Reduction Techniques`),
    
    createUserMessage(`Now create a mindmap for: "${topic}"`)
  ];
}

export function createFollowUpMindmapPrompt(
  originalPrompt: string,
  currentMindmap: string,
  followUpQuestion: string,
  previousPrompts: string[]
): CoreMessage[] {
  return [
    createSystemMessage(MINDMAP_SYSTEM_PROMPT),
    createUserMessage(`<context>
You previously created this mindmap for "${originalPrompt}":

${currentMindmap}

The user now asks: "${followUpQuestion}"

Previous questions in this session: ${previousPrompts.join(", ")}
</context>

<enhancement_process>
Follow this enhancement process:

1. **Question Analysis**: What specific aspect does the user want to explore?
2. **Information Currency**: Does this follow-up require current information? Use web search if needed.
3. **Integration Assessment**: How does this relate to the existing mindmap?
4. **Enhancement Strategy**: Should I add, expand, reorganize, or refine?
5. **Quality Check**: Does the updated mindmap maintain balance and clarity?
</enhancement_process>

<update_strategy>
Update the mindmap by:
- Adding relevant new sections if needed
- Expanding existing sections with more detail
- Reorganizing content for better flow
- Refining existing content for clarity
- Maintaining the overall structure and balance
- Including current information when relevant (use web search)
</update_strategy>

<important>
Provide the complete updated mindmap, ensuring it addresses the follow-up question while maintaining coherence with the original topic.
</important>`),
  ];
}

// TOPIC SHIFT DETECTION PROMPTS

export function createTopicShiftPrompt(
  currentTopic: string,
  originalPrompt: string,
  followUpQuestion: string
): CoreMessage[] {
  return [
    createSystemMessage(TOPIC_SHIFT_SYSTEM_PROMPT),
    createUserMessage(`<analysis_task>
Analyze this follow-up question for topic shift:

**Current Mindmap Topic**: "${currentTopic}"
**Original Prompt**: "${originalPrompt}"
**Follow-up Question**: "${followUpQuestion}"
</analysis_task>

<analysis_steps>
Perform this analysis:

1. **Semantic Relationship**: How related are these topics conceptually?
2. **Scope Assessment**: Would the follow-up fit within the current mindmap's scope?
3. **User Intent**: What is the user likely trying to achieve?
4. **Integration Feasibility**: Can this be meaningfully integrated?
</analysis_steps>

<examples>
Examples for reference:
- Current: "Python Programming Basics" + Follow-up: "How do I handle exceptions?" → NOT a shift
- Current: "Python Programming Basics" + Follow-up: "Best investment strategies" → IS a shift
- Current: "Healthy Cooking" + Follow-up: "What about meal prep?" → NOT a shift
- Current: "Healthy Cooking" + Follow-up: "How to fix my car?" → IS a shift
</examples>

<important>
Provide your analysis in the required JSON format.
</important>`),
  ];
}

// PROMPT ENHANCEMENT UTILITIES

export function enhancePromptWithContext(
  basePrompt: string,
  context: {
    userExpertise?: 'beginner' | 'intermediate' | 'advanced';
    purpose?: 'learning' | 'reference' | 'teaching' | 'planning';
    timeConstraint?: 'quick' | 'detailed' | 'comprehensive';
    format?: 'academic' | 'practical' | 'creative';
  }
): string {
  let enhancement = basePrompt;
  
  if (context.userExpertise) {
    enhancement += `\n\nTarget Audience: ${context.userExpertise} level`;
  }
  
  if (context.purpose) {
    enhancement += `\nPurpose: For ${context.purpose}`;
  }
  
  if (context.timeConstraint) {
    enhancement += `\nDepth: ${context.timeConstraint} coverage`;
  }
  
  if (context.format) {
    enhancement += `\nStyle: ${context.format} approach`;
  }
  
  return enhancement;
}

export function addChainOfThoughtPrompting(prompt: string): string {
  return `${prompt}

<thinking>
Before generating the mindmap, think through this step by step:
1. What are the core components of this topic?
2. How should I organize these components hierarchically?
3. What details are most important for each component?
4. How can I ensure balanced coverage across all areas?
</thinking>

<task>
Now generate the mindmap:
</task>`;
}