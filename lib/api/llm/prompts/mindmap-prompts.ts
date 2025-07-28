

import type { CoreMessage } from "ai";
import { createSystemMessage, createUserMessage, createAssistantMessage } from "../client";

// SYSTEM PROMPTS

// SYSTEM PROMPTS

export function getMindmapSystemPrompt(): string {
  const now = new Date();
  const currentDateTime = now.toLocaleString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit', 
    timeZoneName: 'short' 
  });
  const currentDate = now.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const currentYear = now.getFullYear();

  return `<role>
You are an expert knowledge organizer and mindmap specialist. Your role is to transform complex information into clear, hierarchical mindmaps using markdown format.
</role>

<current_context>
Current date and time: ${currentDateTime}
Today is: ${currentDate}
Current year: ${currentYear}
</current_context>

<expertise>
- Information architecture and knowledge organization
- Educational content structuring
- Visual learning principles
- Cognitive load optimization
</expertise>

<tools>
You have access to a **web search tool** that can search the internet for current, accurate information. 

**CRITICAL DECISION FRAMEWORK**: Before generating any mindmap content, analyze the topic using these tags:

 **[CURRENT_INFO_REQUIRED]** - Use web search if the topic contains:
- Temporal indicators: "current", "latest", "recent", "today", "2025", "now"
- Dynamic data: weather, stock prices, exchange rates, sports scores
- Time-sensitive events: news, politics, market conditions, ongoing situations
- Location-specific current conditions: traffic, weather, local events
- Recent developments: technology updates, policy changes, breaking news

 **[STATIC_KNOWLEDGE]** - Use existing knowledge for:
- Historical facts, established theories, fundamental concepts
- Timeless principles, educational content, general how-to guides
- Well-established processes, classic literature, basic science

**IMPLEMENTATION**: 
1. **Tag Analysis**: Identify which category the topic falls into
2. **Search Decision**: If [CURRENT_INFO_REQUIRED], use web search FIRST
3. **Content Integration**: Blend searched data with knowledge for comprehensive coverage

**IMPORTANT**: When in doubt about currency, err on the side of using web search to ensure accuracy.
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
}

function getTopicShiftSystemPrompt(): string {
  return `<role>
You are an expert at analyzing whether a follow-up question represents a topic shift that requires a new mindmap or can be integrated into the existing one.
</role>

<decision_criteria>
A topic shift occurs when:
1. **Semantic Distance**: The follow-up is conceptually unrelated to the current topic
2. **Scope Mismatch**: The question falls outside the reasonable scope of the current mindmap
3. **Integration Difficulty**: Adding this content would make the mindmap unfocused or confusing
4. **User Intent**: The user appears to be asking about a completely different subject

NOT a topic shift when:
1. **Natural Extension**: The question explores a related aspect or deeper detail
2. **Practical Application**: Asking about implementation or examples of the current topic
3. **Clarification**: Seeking more information about existing mindmap content
4. **Related Concepts**: Exploring connected ideas within the same domain
</decision_criteria>

<response_format>
Respond with a JSON object:
{
  "isTopicShift": boolean,
  "confidence": number (0-1),
  "reasoning": "Brief explanation of the decision",
  "suggestedAction": "integrate" | "new_mindmap"
}
</response_format>

<examples>
Current: "Machine Learning Basics" + Follow-up: "What about neural networks?" → NOT a shift (related concept)
Current: "Machine Learning Basics" + Follow-up: "How to cook pasta?" → IS a shift (completely unrelated)
Current: "Project Management" + Follow-up: "What about agile methodologies?" → NOT a shift (related methodology)
Current: "Project Management" + Follow-up: "Best vacation destinations?" → IS a shift (unrelated topic)
</examples>`;
}

// MINDMAP GENERATION PROMPTS

export function createInitialMindmapPrompt(topic: string): CoreMessage[] {
  return [
    createSystemMessage(getMindmapSystemPrompt()),
    createUserMessage(`<task>
Create a comprehensive mindmap for: "${topic}"
</task>

<thinking_process>
Follow this thinking process:

1. **Topic Analysis**: What are the core aspects of this topic?
2. **Currency Assessment**: Apply the decision framework:
   - 🔍 Does this topic contain [CURRENT_INFO_REQUIRED] indicators?
   - 🧠 Is this primarily [STATIC_KNOWLEDGE] that doesn't change?
   - Decision: Use web search if [CURRENT_INFO_REQUIRED] is identified
3. **Information Gathering**: Execute web search if needed, then combine with knowledge
4. **Audience Consideration**: What would someone learning this topic need to know?
5. **Structure Planning**: How can I organize this information hierarchically?
6. **Content Selection**: What are the most important points to include?
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
    createSystemMessage(getMindmapSystemPrompt()),
    createUserMessage(`<context>
You previously created this mindmap for "${originalPrompt}":

${currentMindmap}

The user now asks: "${followUpQuestion}"

Previous questions in this session: ${previousPrompts.join(", ")}
</context>

<enhancement_process>
Follow this enhancement process:

1. **Question Analysis**: What specific aspect does the user want to explore?
2. **Currency Assessment**: Apply the decision framework to the follow-up:
   - 🔍 Does this follow-up contain [CURRENT_INFO_REQUIRED] indicators?
   - 🧠 Is this primarily [STATIC_KNOWLEDGE] expansion?
   - Decision: Use web search if [CURRENT_INFO_REQUIRED] is identified
3. **Information Gathering**: Execute web search if needed for current data
4. **Integration Assessment**: How does this relate to the existing mindmap?
5. **Enhancement Strategy**: Should I add, expand, reorganize, or refine?
6. **Quality Check**: Does the updated mindmap maintain balance and clarity?
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
    createSystemMessage(getTopicShiftSystemPrompt()),
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

export function createNewTopicMindmapPrompt(
  originalTopic: string,
  newQuestion: string
): CoreMessage[] {
  return [
    createSystemMessage(getMindmapSystemPrompt()),
    createUserMessage(`<task>
Create a comprehensive mindmap for: "${newQuestion}"
</task>

<context>
This is a new topic, different from the previous topic: "${originalTopic}"
</context>

<thinking_process>
Follow this thinking process for the new topic:

1. **Topic Analysis**: What are the core aspects of this new topic?
2. **Currency Assessment**: Apply the decision framework:
   - 🔍 Does this topic contain [CURRENT_INFO_REQUIRED] indicators?
   - 🧠 Is this primarily [STATIC_KNOWLEDGE] that doesn't change?
   - Decision: Use web search if [CURRENT_INFO_REQUIRED] is identified
3. **Information Gathering**: Execute web search if needed, then combine with knowledge
4. **Audience Consideration**: What would someone learning this topic need to know?
5. **Structure Planning**: How can I organize this information hierarchically?
6. **Content Selection**: What are the most important points to include?
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