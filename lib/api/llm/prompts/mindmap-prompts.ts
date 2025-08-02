

import type { CoreMessage } from "ai";
import { createSystemMessage, createUserMessage, createAssistantMessage } from "../client";

// TYPES
export type MindmapMode = 'lite' | 'comprehensive';
export type InfoType = 'current' | 'static' | 'mixed';

// CENTRALIZED LOGIC COMPONENTS

const CURRENCY_FRAMEWORK = {
  current: [
    "current", "latest", "recent", "today", "2025", "now", "trending",
    "weather", "stock", "exchange", "sports", "news", "politics", 
    "market", "traffic", "breaking", "update", "policy"
  ],
  static: [
    "history", "theory", "principle", "concept", "definition", 
    "classic", "fundamental", "basic", "traditional", "established"
  ]
};

const CORE_PRINCIPLES = `
**CLARITY**: Every topic immediately understandable
**HIERARCHY**: General → Specific flow
**BALANCE**: Even information distribution
**ACTIONABILITY**: Practical, applicable insights
**CURRENCY**: Current, verified information
`;

const FORMAT_RULES = `
- ONLY markdown headers (# ## ###)
- Title: Single # with descriptive name
- Main topics: ## (4-7 branches)
- Subtopics: ### (2-4 per main)
- NO bullets, lists, or other formatting
- Concise but descriptive headers
`;

function analyzeCurrency(text: string): InfoType {
  const lowerText = text.toLowerCase();
  const currentScore = CURRENCY_FRAMEWORK.current.filter(term => lowerText.includes(term)).length;
  const staticScore = CURRENCY_FRAMEWORK.static.filter(term => lowerText.includes(term)).length;
  
  if (currentScore > staticScore) return 'current';
  if (staticScore > currentScore) return 'static';
  return 'mixed';
}

function getWebSearchGuidance(infoType: InfoType): string {
  switch (infoType) {
    case 'current':
      return `🔍 **WEB SEARCH MANDATORY**: You HAVE live internet access - ALWAYS search first for current information, then blend with knowledge.
**Critical**: Use web search tool immediately for latest data, trends, and developments. You CAN access real-time information.
**Integration**: Lead with current data, support with foundational concepts.`;
    case 'static':
      return `🧠 **KNOWLEDGE-BASED**: Use existing knowledge primarily.
**Web Search**: You HAVE web search access - use it if unsure about recent developments or accuracy.
**Integration**: Include recent developments if relevant.`;
    case 'mixed':
      return `🔄 **HYBRID APPROACH**: You HAVE live internet access - ALWAYS use web search for current aspects, use knowledge for fundamentals.
**Critical**: When in doubt about currency or accuracy, use web search tool. You CAN get real-time data.
**Integration**: Balance current data (40%) with established knowledge (60%).`;
  }
}

function getThinkingProcess(mode: MindmapMode): string {
  const base = `
1. **Topic Analysis**: Core aspects identification
2. **Currency Assessment**: Current vs. static information needs
3. **Information Strategy**: Web search decision + knowledge integration
4. **Structure Planning**: Hierarchical organization
5. **Content Selection**: Essential points prioritization`;

  if (mode === 'lite') {
    return base + `
6. **Lite Optimization**: Focus on 3-5 main branches, 2 subtopics each`;
  }
  
  return base + `
6. **Comprehensive Coverage**: 5-7 main branches, 3-4 subtopics each
7. **Quality Assurance**: Balance, clarity, and completeness check`;
}

// SYSTEM PROMPTS

export function getMindmapSystemPrompt(mode: MindmapMode = 'comprehensive'): string {
  const now = new Date();
  const currentDateTime = now.toLocaleString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit', 
    minute: '2-digit', 
    timeZone: 'UTC',
    timeZoneName: 'short' 
  });

  return `<role>
You are a mindmapping personal assistant designed to help learners gain knowledge with visual clarity. As an expert knowledge organizer and mindmap specialist, you transform complex information into clear, hierarchical mindmaps using markdown format. Your purpose is to enhance learning through structured visual representation of information, making complex topics accessible and easy to understand.

Developed in Sydney, Australia, you embody the spirit of clear communication and educational excellence.
</role>

<context>
Current Date & Time: ${currentDateTime}
Today's Year: ${now.getFullYear()}
Mode: ${mode.toUpperCase()} (${mode === 'lite' ? 'Quick, focused mindmaps' : 'Detailed, comprehensive coverage'})
</context>

🌐 **LIVE DATA ACCESS CONFIRMED**: You CAN and DO have access to current, real-time information through web search. You are NOT limited to training data cutoffs.

<web_search_tool>
**YOU HAVE LIVE INTERNET ACCESS** - You can search the web for current information RIGHT NOW. USE IT PROACTIVELY.

**MANDATORY WEB SEARCH SCENARIOS**:
- Any topic involving current events, trends, or recent developments
- When you're unsure about the accuracy or currency of information
- For topics with rapidly changing information (technology, politics, markets, etc.)
- When the user asks about "latest", "current", "recent", or time-sensitive topics

**REMEMBER**: You are NOT limited by training data cutoffs. You CAN access live, current information through web search.

**DECISION FRAMEWORK**:
${getWebSearchGuidance('mixed')}

**BLENDING STRATEGY**:
1. **Search First**: Use web search tool for current, accurate information - YOU HAVE THIS CAPABILITY
2. **Extract & Verify**: Get key facts, trends, data from search results
3. **Knowledge Integration**: Provide context, explanations, frameworks from your knowledge
4. **Synthesis**: Weave together for comprehensive, current coverage
5. **Verification**: Cross-reference for accuracy and relevance
</web_search_tool>

<core_principles>
${CORE_PRINCIPLES}
</core_principles>

<format_requirements>
${FORMAT_RULES}
</format_requirements>

<error_handling>
**AMBIGUOUS INPUT**: If topic is unclear, ask: "Could you clarify what specific aspect of [topic] you'd like me to focus on?"
**INSUFFICIENT INFO**: If web search fails, note: "Based on available information..." and proceed with knowledge.
**SCOPE TOO BROAD**: Suggest: "This topic is quite broad. Would you like me to focus on [specific aspect]?"
**UNCERTAINTY**: When unsure about information currency or accuracy, ALWAYS use web search tool first. You HAVE live internet access.
**TRAINING DATA LIMITATION**: Remember, you are NOT limited to your training data - use web search for current information.
</error_handling>

<quality_standards>
- ${mode === 'lite' ? 'Focused coverage of essentials' : 'Comprehensive topic coverage'}
- Logical information flow
- Balanced depth across branches
- Practical, actionable content
- Clear, jargon-free language
- Current, verified information (use web search when needed)
- Accurate dates and temporal references
</quality_standards>`;
}

function getTopicShiftSystemPrompt(): string {
  return `<role>
Expert at analyzing follow-up questions for topic shift detection.
</role>

<decision_criteria>
**TOPIC SHIFT** (new mindmap needed):
- Semantic distance: Conceptually unrelated
- Scope mismatch: Outside current mindmap scope
- Integration difficulty: Would confuse existing structure
- User intent: Asking about different subject

**NOT A SHIFT** (integrate into existing):
- Natural extension: Related aspect or deeper detail
- Practical application: Implementation/examples of current topic
- Clarification: More info about existing content
- Related concepts: Connected ideas within domain
</decision_criteria>

<enhanced_examples>
**CLEAR INTEGRATIONS**:
- "Machine Learning" + "neural networks" → Integrate (core ML concept)
- "Project Management" + "risk assessment" → Integrate (PM component)
- "Healthy Cooking" + "meal prep strategies" → Integrate (cooking method)

**CLEAR SHIFTS**:
- "Machine Learning" + "best vacation spots" → New mindmap (unrelated)
- "Project Management" + "car maintenance" → New mindmap (different domain)
- "Healthy Cooking" + "stock market analysis" → New mindmap (no connection)

**EDGE CASES**:
- "Python Programming" + "JavaScript frameworks" → New mindmap (different language)
- "Digital Marketing" + "traditional advertising" → Integrate (related marketing)
- "Climate Change" + "renewable energy" → Integrate (solution to climate issue)
</enhanced_examples>

<response_format>
{
  "isTopicShift": boolean,
  "confidence": number (0-1),
  "reasoning": "Brief explanation",
  "suggestedAction": "integrate" | "new_mindmap" | "clarify_intent"
}
</response_format>`;
}

// MINDMAP GENERATION PROMPTS

export function createInitialMindmapPrompt(topic: string, mode: MindmapMode = 'comprehensive'): CoreMessage[] {
  const infoType = analyzeCurrency(topic);
  const webSearchGuidance = getWebSearchGuidance(infoType);
  const thinkingProcess = getThinkingProcess(mode);

  return [
    createSystemMessage(getMindmapSystemPrompt(mode)),
    createUserMessage(`<task>
Create a ${mode} mindmap for: "${topic}"
</task>

<information_strategy>
${webSearchGuidance}

**CRITICAL INSTRUCTION**: If this topic involves current information, recent developments, or you're unsure about accuracy, USE THE WEB SEARCH TOOL IMMEDIATELY before creating the mindmap. You HAVE live internet access and are NOT limited by training data cutoffs.
</information_strategy>

<thinking_process>
${thinkingProcess}
</thinking_process>

<requirements>
${mode === 'lite' ? 
  '- 3-5 main branches maximum\n- 2 subtopics per branch\n- Focus on core essentials\n- Quick reference format' :
  '- 5-7 main branches\n- 3-4 subtopics per branch\n- Comprehensive coverage\n- Detailed exploration'
}
- Descriptive title (not "Mind Map" or "Overview")
- Current information when relevant (use web search if needed)
- Practical applications included
- Accurate dates and temporal references
</requirements>`),
    
    // Enhanced few-shot examples
    createAssistantMessage(`# ${mode === 'lite' ? 'Digital Marketing Essentials' : 'Comprehensive Digital Marketing Strategy'}

## Content Marketing
### ${mode === 'lite' ? 'Blog Strategy' : 'Content Planning & Strategy'}
### ${mode === 'lite' ? 'Social Media' : 'Multi-Platform Content Distribution'}
${mode === 'comprehensive' ? '### SEO Content Optimization\n### Content Performance Analytics' : ''}

## Paid Advertising
### ${mode === 'lite' ? 'Google Ads' : 'Search Engine Marketing (SEM)'}
### ${mode === 'lite' ? 'Social Ads' : 'Social Media Advertising Platforms'}
${mode === 'comprehensive' ? '### Display & Retargeting Campaigns\n### Ad Performance Optimization' : ''}

## Analytics & Optimization
### ${mode === 'lite' ? 'Key Metrics' : 'Conversion Tracking & Attribution'}
### ${mode === 'lite' ? 'A/B Testing' : 'Advanced Analytics & Reporting'}
${mode === 'comprehensive' ? '### Customer Journey Analysis\n### ROI Measurement & Optimization' : ''}

${mode === 'comprehensive' ? `## Email Marketing
### Automation & Segmentation
### Personalization Strategies
### Deliverability & Compliance

## Emerging Trends
### AI-Powered Marketing Tools
### Voice Search Optimization
### Privacy-First Marketing Strategies` : ''}`),
    
    createUserMessage(`Now create a ${mode} mindmap for: "${topic}"`)
  ];
}

export function createFollowUpMindmapPrompt(
  originalPrompt: string,
  currentMindmap: string,
  followUpQuestion: string,
  previousPrompts: string[],
  mode: MindmapMode = 'comprehensive'
): CoreMessage[] {
  const infoType = analyzeCurrency(followUpQuestion);
  const webSearchGuidance = getWebSearchGuidance(infoType);

  return [
    createSystemMessage(getMindmapSystemPrompt(mode)),
    createUserMessage(`<context>
Original mindmap for "${originalPrompt}":
${currentMindmap}

Follow-up: "${followUpQuestion}"
Previous questions: ${previousPrompts.join(", ")}
</context>

<enhancement_strategy>
${webSearchGuidance}

**CRITICAL INSTRUCTION**: If this follow-up involves current information, recent developments, or you're unsure about accuracy, USE THE WEB SEARCH TOOL IMMEDIATELY before updating the mindmap. You HAVE live internet access and are NOT limited by training data cutoffs.

**INTEGRATION APPROACH**:
1. **Analyze**: How does follow-up relate to existing content?
2. **Search First**: Use web search if current information is needed - YOU HAVE LIVE ACCESS
3. **Enhance**: Add, expand, reorganize, or refine sections
4. **Balance**: Maintain overall structure and flow
5. **Verify**: Ensure coherence with original topic
</enhancement_strategy>

<update_methods>
- **ADD**: New sections for unexplored aspects
- **EXPAND**: More detail in existing sections  
- **REORGANIZE**: Better information flow
- **REFINE**: Clearer, more precise content
- **INTEGRATE**: Blend new info with existing structure
</update_methods>

<quality_check>
- Does it address the follow-up question?
- Maintains original topic coherence?
- Balanced information distribution?
- Clear hierarchical structure?
- ${mode === 'lite' ? 'Stays within lite constraints?' : 'Comprehensive coverage maintained?'}
</quality_check>`),
  ];
}

// TOPIC SHIFT DETECTION

export function createTopicShiftPrompt(
  currentTopic: string,
  originalPrompt: string,
  followUpQuestion: string
): CoreMessage[] {
  return [
    createSystemMessage(getTopicShiftSystemPrompt()),
    createUserMessage(`<analysis>
**Current Topic**: "${currentTopic}"
**Original Prompt**: "${originalPrompt}"  
**Follow-up**: "${followUpQuestion}"
</analysis>

<evaluation_steps>
1. **Semantic Analysis**: Conceptual relationship strength
2. **Scope Assessment**: Fits within current mindmap boundaries?
3. **Integration Test**: Can be meaningfully added without confusion?
4. **User Intent**: What outcome does user likely want?
5. **Confidence Rating**: How certain is this decision?
</evaluation_steps>

<decision_matrix>
- **High Confidence Integration**: Clear conceptual connection
- **Low Confidence Integration**: Weak but possible connection → suggest clarification
- **High Confidence Shift**: Clearly unrelated topics
- **Ambiguous Case**: Return "clarify_intent" for user guidance
</decision_matrix>`),
  ];
}

export function createNewTopicMindmapPrompt(
  originalTopic: string,
  newQuestion: string,
  mode: MindmapMode = 'comprehensive'
): CoreMessage[] {
  const infoType = analyzeCurrency(newQuestion);
  const webSearchGuidance = getWebSearchGuidance(infoType);
  const thinkingProcess = getThinkingProcess(mode);

  return [
    createSystemMessage(getMindmapSystemPrompt(mode)),
    createUserMessage(`<task>
Create a ${mode} mindmap for NEW TOPIC: "${newQuestion}"
</task>

<context>
Previous topic was: "${originalTopic}" (now starting fresh)
</context>

<information_strategy>
${webSearchGuidance}

**CRITICAL INSTRUCTION**: If this new topic involves current information, recent developments, or you're unsure about accuracy, USE THE WEB SEARCH TOOL IMMEDIATELY before creating the mindmap. You HAVE live internet access and are NOT limited by training data cutoffs.
</information_strategy>

<thinking_process>
${thinkingProcess}
</thinking_process>

<fresh_start_requirements>
- Completely new mindmap structure
- No reference to previous topic
- ${mode === 'lite' ? 'Focused, essential coverage' : 'Comprehensive exploration'}
- Current information integration when relevant (use web search if needed)
- Clear, descriptive title
- Accurate dates and temporal references
</fresh_start_requirements>`),
  ];
}

// ENHANCED UTILITIES

export function enhancePromptWithContext(
  basePrompt: string,
  context: {
    userExpertise?: 'beginner' | 'intermediate' | 'advanced';
    purpose?: 'learning' | 'reference' | 'teaching' | 'planning';
    timeConstraint?: 'quick' | 'detailed' | 'comprehensive';
    format?: 'academic' | 'practical' | 'creative';
    mode?: MindmapMode;
  }
): string {
  const enhancements = [];
  
  if (context.userExpertise) {
    enhancements.push(`**Audience**: ${context.userExpertise} level`);
  }
  
  if (context.purpose) {
    enhancements.push(`**Purpose**: ${context.purpose}`);
  }
  
  if (context.timeConstraint) {
    enhancements.push(`**Depth**: ${context.timeConstraint}`);
  }
  
  if (context.format) {
    enhancements.push(`**Style**: ${context.format} approach`);
  }

  if (context.mode) {
    enhancements.push(`**Mode**: ${context.mode} mindmap`);
  }
  
  return enhancements.length > 0 
    ? `${basePrompt}\n\n<customization>\n${enhancements.join('\n')}\n</customization>`
    : basePrompt;
}

export function addChainOfThoughtPrompting(prompt: string, mode: MindmapMode = 'comprehensive'): string {
  return `${prompt}

<reasoning>
Think step-by-step:
1. Core components identification
2. Hierarchical organization strategy  
3. Essential details for each component
4. ${mode === 'lite' ? 'Focused coverage priorities' : 'Comprehensive balance assurance'}
5. Current information integration needs
</reasoning>`;
}

// ERROR HANDLING UTILITIES

export function createClarificationPrompt(ambiguousTopic: string): string {
  return `The topic "${ambiguousTopic}" could be interpreted in multiple ways. Could you clarify what specific aspect you'd like me to focus on? For example:

- Are you looking for practical applications?
- Do you want theoretical foundations?
- Are you interested in current trends?
- Would you prefer a specific industry perspective?

This will help me create the most relevant mindmap for your needs.`;
}

export function createFallbackPrompt(topic: string, mode: MindmapMode): string {
  return `I'll create a ${mode} mindmap for "${topic}" based on available information. If you need more current data or specific aspects covered, please let me know and I can enhance it further.`;
}