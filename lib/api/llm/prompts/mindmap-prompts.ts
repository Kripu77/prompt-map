

import type { CoreMessage } from "ai";
import { createSystemMessage, createUserMessage, createAssistantMessage } from "../client";

// TYPES
export type MindmapMode = 'lite' | 'comprehensive';
export type InfoType = 'current' | 'static' | 'mixed';



// CONSTANTS
const CURRENCY_KEYWORDS = {
  current: new Set([
    "current", "latest", "recent", "today", "2025", "now", "trending",
    "weather", "stock", "exchange", "sports", "news", "politics", 
    "market", "traffic", "breaking", "update", "policy"
  ]),
  static: new Set([
    "history", "theory", "principle", "concept", "definition", 
    "classic", "fundamental", "basic", "traditional", "established"
  ])
} as const;

const LINK_GUIDANCE = {
  current: "ALWAYS include source links using [text](URL) format",
  static: "Include authoritative source links when available",
  mixed: "ALWAYS include source links for current information"
} as const;

const MODE_CONFIG = {
  lite: {
    branches: '3-5 main branches maximum',
    subtopics: '2 subtopics per branch',
    focus: 'Focus on core essentials',
    format: 'Quick reference format',
    description: 'Quick, focused mindmaps'
  },
  comprehensive: {
    branches: '5-7 main branches',
    subtopics: '3-4 subtopics per branch', 
    focus: 'Comprehensive coverage',
    format: 'Detailed exploration',
    description: 'Detailed, comprehensive coverage'
  }
} as const;

const CORE_PRINCIPLES = `
**CLARITY**: Every topic immediately understandable
**HIERARCHY**: General → Specific flow
**BALANCE**: Even information distribution
**ACTIONABILITY**: Practical, applicable insights
**CURRENCY**: Current, verified information
**INTERACTIVITY**: Relevant links for deeper exploration
**ATTRIBUTION**: Proper citation of web sources
`;

const FORMAT_RULES = `
- ONLY markdown headers (# ## ###)
- Title: Single # with descriptive name
- Main topics: ## (4-7 branches)
- Subtopics: ### (2-4 per main)
- NO bullets, lists, or other formatting
- Concise but descriptive headers
- Include relevant links using markdown format: [text](URL)
- For web search results, always include source links
- Support for rich text formatting within headers: **bold**, *italic*, ~~strikethrough~~, \`code\`
- Support for mathematical expressions using KaTeX: 
  * Use proper LaTeX syntax: $\\frac{a}{b}$ not $rac{a}{b}$
  * Use \\times for multiplication: $a \\times b$ not $a imes b$
  * Examples: $x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$, $S = \\frac{\\text{Successful Days}}{\\text{Total Days}} \\times 100\\%$
  * Always escape backslashes properly in LaTeX commands
- Support for code blocks with proper markdown syntax:
  \`\`\`language
  code here
  \`\`\`
- Support for tables to display structured data
`;

function analyzeCurrency(text: string): InfoType {
  const lowerText = text.toLowerCase();
  const currentScore = Array.from(CURRENCY_KEYWORDS.current).filter(term => lowerText.includes(term)).length;
  const staticScore = Array.from(CURRENCY_KEYWORDS.static).filter(term => lowerText.includes(term)).length;
  
  if (currentScore > staticScore) return 'current';
  if (staticScore > currentScore) return 'static';
  return 'mixed';
}

const WEB_SEARCH_TEMPLATES = {
  current: `🔍 **WEB SEARCH MANDATORY**: You HAVE live internet access - ALWAYS search first for current information, then blend with knowledge.
**Critical**: Use web search tool immediately for latest data, trends, and developments. You CAN access real-time information.
**Integration**: Lead with current data, support with foundational concepts.
**Links**: ${LINK_GUIDANCE.current}. These links make the mindmap interactive.`,
  
  static: `🧠 **KNOWLEDGE-BASED**: Use existing knowledge primarily.
**Web Search**: You HAVE web search access - use it if unsure about recent developments or accuracy.
**Integration**: Include recent developments if relevant.
**Links**: When using web search, ${LINK_GUIDANCE.static} using markdown format [text](URL) to make the mindmap interactive.`,
  
  mixed: `🔄 **HYBRID APPROACH**: You HAVE live internet access - ALWAYS use web search for current aspects, use knowledge for fundamentals.
**Critical**: When in doubt about currency or accuracy, use web search tool. You CAN get real-time data.
**Integration**: Balance current data (40%) with established knowledge (60%).
**Links**: ${LINK_GUIDANCE.mixed} using markdown format [text](URL). These links make the mindmap interactive and provide attribution.`
} as const;

function getWebSearchGuidance(infoType: InfoType): string {
  return WEB_SEARCH_TEMPLATES[infoType];
}

const THINKING_PROCESS_BASE = [
  '**Topic Analysis**: Core aspects identification',
  '**Currency Assessment**: Current vs. static information needs',
  '**Information Strategy**: Web search decision + knowledge integration',
  '**Link Integration**: Include source URLs from web search as markdown links',
  '**Structure Planning**: Hierarchical organization',
  '**Content Selection**: Essential points prioritization'
] as const;

const THINKING_PROCESS_EXTENSIONS = {
  lite: ['**Lite Optimization**: Focus on 3-5 main branches, 2 subtopics each'],
  comprehensive: [
    '**Comprehensive Coverage**: 5-7 main branches, 3-4 subtopics each',
    '**Quality Assurance**: Balance, clarity, and completeness check'
  ]
} as const;

function getThinkingProcess(mode: MindmapMode): string {
  const steps = [...THINKING_PROCESS_BASE, ...THINKING_PROCESS_EXTENSIONS[mode]];
  return steps.map((step, index) => `${index + 1}. ${step}`).join('\n');
}

// TEMPLATE CONSTANTS
const COMMON_REQUIREMENTS = [
  'Descriptive title (not "Mind Map" or "Overview")',
  'Current information when relevant (use web search if needed)',
  'Practical applications included',
  'Accurate dates and temporal references',
  'Include relevant links using markdown format [text](URL)',
  'For web search results, ALWAYS include source links to make the mindmap interactive'
] as const;

const QUALITY_STANDARDS = [
  'Logical information flow',
  'Balanced depth across branches',
  'Practical, actionable content',
  'Clear, jargon-free language',
  'Current, verified information (use web search when needed)',
  'Accurate dates and temporal references'
] as const;

// UTILITY FUNCTIONS
function formatDateTime(date: Date): string {
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
}

function formatDate(date: Date): string {
  return date.toLocaleString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });
}

function generateRequirements(mode: MindmapMode, additionalRequirements: string[] = []): string {
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
}

// SYSTEM PROMPTS

export function getMindmapSystemPrompt(mode: MindmapMode = 'comprehensive', customDate?: Date): string {
  const now = customDate || new Date();
  const currentDateTime = formatDateTime(now);

  return `<role>
You are a mindmapping personal assistant designed to help learners gain knowledge with visual clarity. As an expert knowledge organizer and mindmap specialist, you transform complex information into clear, hierarchical mindmaps using markdown format. Your purpose is to enhance learning through structured visual representation of information, making complex topics accessible and easy to understand.

Developed in Sydney, Australia, you embody the spirit of clear communication and educational excellence.
</role>

<context>
Current Date & Time: ${currentDateTime}
Today's Year: ${now.getFullYear()}
Mode: ${mode.toUpperCase()} (${MODE_CONFIG[mode].description})
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
6. **Link Integration**: ALWAYS include source links from web search results using markdown format [text](URL)

**INTERACTIVE LINKS REQUIREMENT**:
- For each web search result you use, include the source URL as a markdown link
- Format: [Descriptive Text](URL) - never use raw URLs
- Place links directly in the mindmap headers where the information is used
- Links make the mindmap interactive and provide attribution to sources
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
- ${MODE_CONFIG[mode].focus}
${QUALITY_STANDARDS.map(standard => `- ${standard}`).join('\n')}
</quality_standards>`;
}

function getTopicShiftSystemPrompt(customDate?: Date): string {
  const now = customDate || new Date();
  const currentDate = formatDate(now);
  const currentYear = now.getFullYear();

  return `<role>
Expert at analyzing follow-up questions for topic shift detection.
</role>

<current_date>
${currentDate}
</current_date>

<current_year>
${currentYear}
</current_year>

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

export function createInitialMindmapPrompt(topic: string, mode: MindmapMode = 'comprehensive', customDate?: Date): CoreMessage[] {
  const infoType = analyzeCurrency(topic);
  const webSearchGuidance = getWebSearchGuidance(infoType);
  const thinkingProcess = getThinkingProcess(mode);

  return [
    createSystemMessage(getMindmapSystemPrompt(mode, customDate)),
    createUserMessage(`<task>
Create a ${mode} mindmap for: "${topic}"
</task>

<information_strategy>
${webSearchGuidance}

**CRITICAL INSTRUCTION**: If this topic involves current information, recent developments, or you're unsure about accuracy, USE THE WEB SEARCH TOOL IMMEDIATELY before creating the mindmap. You HAVE live internet access and are NOT limited by training data cutoffs.

**LINK INTEGRATION REQUIREMENT**:
- For each web search result you use, include the source URL as a markdown link
- Format: [Descriptive Text](URL) - never use raw URLs
- Place links directly in the mindmap headers where the information is used
- Links make the mindmap interactive and provide attribution to sources
</information_strategy>

<thinking_process>
${thinkingProcess}
</thinking_process>

<requirements>
${generateRequirements(mode, ['Build upon previous context while maintaining independence'])}
</requirements>`),
     
     // Enhanced few-shot examples
    createAssistantMessage(`# ${mode === 'lite' ? 'Digital Marketing Essentials' : 'Comprehensive Digital Marketing Strategy'}

## Content Marketing
### ${mode === 'lite' ? 'Blog Strategy' : 'Content Planning & **Strategy**'}
### ${mode === 'lite' ? 'Social Media' : 'Multi-Platform Content Distribution [Best Practices](https://buffer.com/library/social-media-marketing-strategy/)'}
### ${mode === 'comprehensive' ? 'Content ROI Formula $ROI = \frac{(Revenue - Cost)}{Cost} \times 100\%$' : ''}
### ${mode === 'comprehensive' ? 'Performance Data with Table Support' : ''}
${mode === 'comprehensive' ? '### SEO Content Optimization [Latest Techniques](https://moz.com/blog/category/seo)\n### Content Performance Analytics' : ''}

## Paid Advertising
### ${mode === 'lite' ? 'Google Ads' : 'Search Engine Marketing (SEM) [Google Ads Guide](https://ads.google.com/home/resources/)'}
### ${mode === 'lite' ? 'Social Ads' : 'Social Media Advertising Platforms [Facebook Ads](https://www.facebook.com/business/ads)'}
${mode === 'comprehensive' ? '### Display & Retargeting Campaigns [Best Practices](https://www.wordstream.com/blog/ws/2015/10/01/remarketing-strategies)\n### Ad Performance Optimization' : ''}

## Analytics & Optimization
### ${mode === 'lite' ? 'Key Metrics' : 'Conversion Tracking & Attribution [Google Analytics](https://analytics.google.com/)'}
### ${mode === 'lite' ? 'A/B Testing' : 'Advanced Analytics & Reporting [A/B Testing Guide](https://vwo.com/ab-testing/)'}
${mode === 'comprehensive' ? '### Customer Journey Analysis\n### ROI Measurement & Optimization [ROI Calculator](https://www.hubspot.com/roi-calculator)' : ''}
### ${mode === 'comprehensive' ? 'Tracking Code Example with Syntax Highlighting' : ''}

${mode === 'comprehensive' ? `## Email Marketing
### Automation & Segmentation [Mailchimp Guide](https://mailchimp.com/resources/email-marketing-strategy/)
### Personalization Strategies
### Deliverability & Compliance [GDPR Overview](https://gdpr.eu/email-marketing/)

## Emerging Trends
### AI-Powered Marketing Tools [AI Marketing Guide](https://www.marketingaiinstitute.com/)
### Voice Search Optimization [Voice SEO Tips](https://backlinko.com/optimize-for-voice-search)
### Privacy-First Marketing Strategies` : ''}`),
    
    createUserMessage(`Now create a ${mode} mindmap for: "${topic}"`)
  ];
}

export function createFollowUpMindmapPrompt(
  originalPrompt: string,
  currentMindmap: string,
  followUpQuestion: string,
  previousPrompts: string[],
  mode: MindmapMode = 'comprehensive',
  customDate?: Date
): CoreMessage[] {
  const infoType = analyzeCurrency(followUpQuestion);
  const webSearchGuidance = getWebSearchGuidance(infoType);

  return [
    createSystemMessage(getMindmapSystemPrompt(mode, customDate)),
    createUserMessage(`<context>
Original mindmap for "${originalPrompt}":
${currentMindmap}

Follow-up: "${followUpQuestion}"
Previous questions: ${previousPrompts.join(", ")}
</context>

<enhancement_strategy>
${webSearchGuidance}

**CRITICAL INSTRUCTION**: If this follow-up involves current information, recent developments, or you're unsure about accuracy, USE THE WEB SEARCH TOOL IMMEDIATELY before updating the mindmap. You HAVE live internet access and are NOT limited by training data cutoffs.

**LINK INTEGRATION REQUIREMENT**:
- For each web search result you use, include the source URL as a markdown link
- Format: [Descriptive Text](URL) - never use raw URLs
- Place links directly in the mindmap headers where the information is used
- Links make the mindmap interactive and provide attribution to sources

**INTEGRATION APPROACH**:
1. **Analyze**: How does follow-up relate to existing content?
2. **Search First**: Use web search if current information is needed - YOU HAVE LIVE ACCESS
3. **Link Integration**: Include source URLs from web search as markdown links [text](URL)
4. **Enhance**: Add, expand, reorganize, or refine sections
5. **Balance**: Maintain overall structure and flow
6. **Verify**: Ensure coherence with original topic
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
- Are relevant links included from web search results?
- Are links formatted correctly using [text](URL) syntax?
</quality_check>`),
  ];
}

// TOPIC SHIFT DETECTION

export function createTopicShiftPrompt(
  currentTopic: string,
  originalPrompt: string,
  followUpQuestion: string,
  customDate?: Date
): CoreMessage[] {
  return [
    createSystemMessage(getTopicShiftSystemPrompt(customDate)),
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
  mode: MindmapMode = 'comprehensive',
  customDate?: Date
): CoreMessage[] {
  const infoType = analyzeCurrency(newQuestion);
  const webSearchGuidance = getWebSearchGuidance(infoType);
  const thinkingProcess = getThinkingProcess(mode);

  return [
    createSystemMessage(getMindmapSystemPrompt(mode, customDate)),
    createUserMessage(`<task>
Create a ${mode} mindmap for NEW TOPIC: "${newQuestion}"
</task>

<context>
Previous topic was: "${originalTopic}" (now starting fresh)
</context>

<information_strategy>
${webSearchGuidance}

**CRITICAL INSTRUCTION**: If this new topic involves current information, recent developments, or you're unsure about accuracy, USE THE WEB SEARCH TOOL IMMEDIATELY before creating the mindmap. You HAVE live internet access and are NOT limited by training data cutoffs.

**LINK INTEGRATION REQUIREMENT**:
- For each web search result you use, include the source URL as a markdown link
- Format: [Descriptive Text](URL) - never use raw URLs
- Place links directly in the mindmap headers where the information is used
- Links make the mindmap interactive and provide attribution to sources
</information_strategy>

<thinking_process>
${thinkingProcess}
</thinking_process>

<fresh_start_requirements>
${generateRequirements(mode, ['Completely new mindmap structure', 'No reference to previous topic'])}
</fresh_start_requirements>`),
  ];
}

// ENHANCED UTILITIES

const THINKING_TEMPLATE = `<reasoning>
Think step-by-step:
1. Core components identification
2. Hierarchical organization strategy  
3. Essential details for each component
4. {{MODE_SPECIFIC}}
5. Current information integration needs
</reasoning>`;

const CONTEXT_MAPPINGS = {
  userExpertise: (value: string) => `**Audience**: ${value} level`,
  purpose: (value: string) => `**Purpose**: ${value}`,
  timeConstraint: (value: string) => `**Depth**: ${value}`,
  format: (value: string) => `**Style**: ${value} approach`,
  mode: (value: string) => `**Mode**: ${value} mindmap`
} as const;

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
  const enhancements = Object.entries(context)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => CONTEXT_MAPPINGS[key as keyof typeof CONTEXT_MAPPINGS]?.(value as string))
    .filter(Boolean);
  
  return enhancements.length > 0 
    ? `${basePrompt}\n\n<customization>\n${enhancements.join('\n')}\n</customization>`
    : basePrompt;
}

export function addChainOfThoughtPrompting(prompt: string, mode: MindmapMode = 'comprehensive'): string {
  const modeSpecific = mode === 'lite' ? 'Focused coverage priorities' : 'Comprehensive balance assurance';
  const reasoning = THINKING_TEMPLATE.replace('{{MODE_SPECIFIC}}', modeSpecific);
  return `${prompt}\n\n${reasoning}`;
}

// ERROR HANDLING UTILITIES

const CLARIFICATION_OPTIONS = [
  'Are you looking for practical applications?',
  'Do you want theoretical foundations?',
  'Are you interested in current trends?',
  'Would you prefer a specific industry perspective?'
] as const;

export function createClarificationPrompt(ambiguousTopic: string): string {
  const options = CLARIFICATION_OPTIONS.map(option => `- ${option}`).join('\n');
  return `The topic "${ambiguousTopic}" could be interpreted in multiple ways. Could you clarify what specific aspect you'd like me to focus on? For example:\n\n${options}\n\nThis will help me create the most relevant mindmap for your needs.`;
}

export function createFallbackPrompt(topic: string, mode: MindmapMode): string {
  return `I'll create a ${mode} mindmap for "${topic}" based on available information. If you need more current data or specific aspects covered, please let me know and I can enhance it further.`;
}

export function createErrorPrompt(error: string): string {
  return `I encountered an issue while processing your request: ${error}\n\nLet me try a different approach. Could you rephrase your question or provide additional context about what you'd like to explore in the mindmap?`;
}