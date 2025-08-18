import type { MindmapMode } from './types';

export const CORE_PRINCIPLES = [
  '**CLARITY**: Every topic immediately understandable',
  '**HIERARCHY**: General → Specific flow',
  '**BALANCE**: Even information distribution',
  '**ACTIONABILITY**: Practical, applicable insights',
  '**CURRENCY**: Current, verified information',
  '**INTERACTIVITY**: Relevant links for deeper exploration',
  '**ATTRIBUTION**: Proper citation of web sources'
] as const;

export const CURRENCY_KEYWORDS = {
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

export const LINK_GUIDANCE = [
  "ALWAYS include source links using [text](URL) format for current information",
  "Include authoritative source links when available for static information", 
  "Use reputable sources (official websites, academic papers, established organizations)",
  "Verify link accuracy and relevance before inclusion",
  "Place links contextually within relevant sections"
] as const;

export const MODE_CONFIG = {
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

export const FORMAT_RULES = {
  structure: `
    <structure_rules>
    - Use ONLY markdown headers (# ## ###) for hierarchy
    - Title: Single # with descriptive name
    - Main topics: ## (4-7 branches for comprehensive, 3-5 for lite)
    - Subtopics: ### (2-4 per main topic)
    - NO bullets, lists, or other formatting in structure
    </structure_rules>
  `,
  content: `
    <content_rules>
    - Include relevant links using [text](URL) format
    - Support rich text: **bold**, *italic*, \`code\`
    - Use clear, accessible language
    - Ensure logical information flow
    - Balance depth across all branches
    </content_rules>
  `,
  links: `
    <link_rules>
    - Always include source links for current information
    - Use authoritative sources when available
    - Format links as [descriptive text](URL)
    - Place links contextually within relevant sections
    </link_rules>
  `,
  mathematics: `
    <mathematics_rules>
    - Use KaTeX for mathematical expressions: $inline$ or $$block$$
    - Include formulas, equations, and mathematical concepts when relevant
    - Ensure proper LaTeX syntax for complex mathematical notation
    - Use \\text{} for text within math expressions
    </mathematics_rules>
  `,
  code: `
    <code_rules>
    - Use code blocks with language specification: \`\`\`language
    - Include syntax highlighting for better readability
    - Use inline code with backticks for short code snippets
    - Provide clear code examples and explanations
    </code_rules>
  `,
  tables: `
    <table_rules>
    - Use markdown tables for structured data comparison
    - Include headers with proper alignment (|:---|:---:|---:|)
    - Keep tables concise and focused on key information
    - Use tables for comparisons, specifications, and data presentation
    </table_rules>
  `,
  formatting: `
    <formatting_rules>
    - Use > for important quotes or key insights
    - Use --- for section breaks when needed
    - Maintain consistent formatting throughout
    - Ensure accessibility with proper contrast and structure
    </formatting_rules>
  `
} as const;

export const WEB_SEARCH_TEMPLATES = {
  current: `
    <web_search_mandatory>
    <priority>🔍 **WEB SEARCH MANDATORY**: You HAVE live internet access - ALWAYS search first for current information, then blend with knowledge.</priority>
    <critical>Use web search tool immediately for latest data, trends, and developments. You CAN access real-time information.</critical>
    <tool_usage_limit>**IMPORTANT**: Limit web search tool calls to a MAXIMUM of 1 search. Choose your search query strategically to gather the most comprehensive and relevant information efficiently.</tool_usage_limit>
    <integration>Lead with current data, support with foundational concepts.</integration>
    <links>ALWAYS include source links using [text](URL) format for current information. These links make the mindmap interactive.</links>
    <mindmap_generation>**CRITICAL**: After gathering web search information, you MUST generate a complete mindmap using the collected data. Do NOT just return search results - create a structured mindmap with proper markdown headers (# ## ###) and organized content.</mindmap_generation>
    </web_search_mandatory>
  `,
  
  static: `
    <knowledge_based>
    <priority>🧠 **KNOWLEDGE-BASED**: Use existing knowledge primarily.</priority>
    <web_search>You HAVE web search access - use it if unsure about recent developments or accuracy.</web_search>
    <tool_usage_limit>**IMPORTANT**: If you need to use web search, limit to a MAXIMUM of 1 search call. Use it only for critical information verification or recent developments.</tool_usage_limit>
    <integration>Include recent developments if relevant.</integration>
    <links>When using web search, include authoritative source links when available using markdown format [text](URL) to make the mindmap interactive.</links>
    <mindmap_generation>**CRITICAL**: Always generate a complete mindmap with proper markdown structure (# ## ###) and organized content. Do NOT just return search results or raw information.</mindmap_generation>
    </knowledge_based>
  `,
  
  mixed: `
    <hybrid_approach>
    <priority>🔄 **HYBRID APPROACH**: You HAVE live internet access - ALWAYS use web search for current aspects, use knowledge for fundamentals.</priority>
    <critical>When in doubt about currency or accuracy, use web search tool. You CAN get real-time data.</critical>
    <tool_usage_limit>**IMPORTANT**: Limit web search tool calls to a MAXIMUM of 1 search. Plan your search strategically to cover both current trends and key developments efficiently.</tool_usage_limit>
    <integration>Balance current data (40%) with established knowledge (60%).</integration>
    <links>Include relevant source links using markdown format [text](URL). These links make the mindmap interactive and provide attribution.</links>
    <mindmap_generation>**CRITICAL**: After gathering web search information, you MUST generate a complete mindmap using the collected data. Do NOT just return search results - create a structured mindmap with proper markdown headers (# ## ###) and organized content.</mindmap_generation>
    </hybrid_approach>
  `
} as const;

export const THINKING_PROCESS_BASE = [
  '**Topic Analysis**: Core aspects identification',
  '**Currency Assessment**: Current vs. static information needs',
  '**Information Strategy**: Web search decision + knowledge integration',
  '**Link Integration**: Include source URLs from web search as markdown links',
  '**Structure Planning**: Hierarchical organization',
  '**Content Selection**: Essential points prioritization'
] as const;

export const THINKING_PROCESS_EXTENSIONS: Record<MindmapMode, readonly string[]> = {
  lite: ['**Lite Optimization**: Focus on 3-5 main branches, 2 subtopics each'],
  comprehensive: [
    '**Comprehensive Coverage**: 5-7 main branches, 3-4 subtopics each',
    '**Quality Assurance**: Balance, clarity, and completeness check'
  ]
} as const;

export const COMMON_REQUIREMENTS = [
  'Descriptive title (not "Mind Map" or "Overview")',
  'Current information when relevant (use web search if needed)',
  'Practical applications included',
  'Accurate dates and temporal references',
  'Include relevant links using markdown format [text](URL)',
  'For web search results, ALWAYS include source links to make the mindmap interactive'
] as const;

export const QUALITY_STANDARDS = [
  'Logical information flow',
  'Balanced depth across branches',
  'Practical, actionable content',
  'Clear, jargon-free language',
  'Current, verified information (use web search when needed)',
  'Accurate dates and temporal references'
] as const;

export const FEW_SHOT_EXAMPLES = {
  comprehensive: `
    <example_comprehensive>
    # Artificial Intelligence in Healthcare

    ## Medical Imaging & Diagnostics
    ### Radiology AI Systems
    <content>
    - **Deep Learning Models**: CNNs for X-ray, MRI, CT scan analysis [Nature Medicine](https://nature.com/articles/s41591-019-0447-x)
    - **FDA Approved Tools**: IDx-DR for diabetic retinopathy, Aidoc for stroke detection
    - **Accuracy Improvements**: 94% sensitivity in mammography screening vs 88% human baseline
    </content>

    ### Pathology & Laboratory
    <content>
    - **Digital Pathology**: Whole slide imaging with AI-powered analysis
    - **Biomarker Discovery**: Machine learning for protein and genetic markers
    - **Lab Automation**: Automated blood analysis and culture identification
    </content>

    ## Treatment & Drug Discovery
    ### Personalized Medicine
    <content>
    - **Genomic Analysis**: AI-driven interpretation of genetic variants
    - **Treatment Optimization**: Algorithms for dosage and drug selection
    - **Predictive Modeling**: Risk assessment for adverse reactions
    </content>

    ### Drug Development
    <content>
    - **Molecular Design**: AI-generated drug compounds and targets
    - **Clinical Trial Optimization**: Patient matching and endpoint prediction
    - **Cost Reduction**: $2.6B average savings per approved drug [McKinsey](https://mckinsey.com/industries/pharmaceuticals-and-medical-products)
    </content>

    ## Patient Care & Monitoring
    ### Remote Health Monitoring
    <content>
    - **Wearable Integration**: Continuous vital sign tracking and analysis
    - **Early Warning Systems**: Sepsis prediction, cardiac event detection
    - **Chronic Disease Management**: Diabetes, hypertension monitoring algorithms
    </content>

    ### Clinical Decision Support
    <content>
    - **Evidence-Based Recommendations**: Real-time treatment suggestions
    - **Risk Stratification**: Patient prioritization and resource allocation
    - **Documentation Automation**: Natural language processing for medical records
    </content>

    ## Challenges & Considerations
    ### Technical Limitations
    <content>
    - **Data Quality**: Incomplete, biased, or inconsistent medical datasets
    - **Interpretability**: Black box algorithms in critical decision-making
    - **Integration Complexity**: Legacy system compatibility and workflow disruption
    </content>

    ### Ethical & Regulatory
    <content>
    - **Privacy Concerns**: HIPAA compliance and patient data protection
    - **Algorithmic Bias**: Disparities in AI performance across demographics
    - **Liability Issues**: Responsibility for AI-assisted medical decisions
    </content>

    ## Future Directions
    ### Emerging Technologies
    <content>
    - **Quantum Computing**: Enhanced drug discovery and molecular simulation
    - **Federated Learning**: Collaborative AI training without data sharing
    - **Multimodal AI**: Integration of imaging, genomics, and clinical data
    </content>

    ### Market Projections
    <content>
    - **Market Size**: $148.4B by 2029 (45.1% CAGR) [Fortune Business Insights](https://fortunebusinessinsights.com)
    - **Investment Trends**: $29.1B in healthcare AI funding (2023)
    - **Adoption Rates**: 35% of healthcare organizations using AI by 2025
    </content>
    </example_comprehensive>
  `,
  lite: `
    <example_lite>
    # Sustainable Energy Solutions

    ## Solar Power Technology
    ### Photovoltaic Systems
    <content>
    - **Efficiency Gains**: Modern panels achieve 22-26% efficiency
    - **Cost Reduction**: 70% price drop since 2010 [IRENA](https://irena.org/publications/2023/Aug/Renewable-power-generation-costs-in-2022)
    - **Grid Integration**: Smart inverters and energy storage solutions
    </content>

    ### Concentrated Solar Power
    <content>
    - **Thermal Storage**: Molten salt systems for 24/7 power generation
    - **Large Scale Deployment**: 6.2 GW global capacity in 2023
    </content>

    ## Wind Energy Systems
    ### Onshore Wind Farms
    <content>
    - **Turbine Advancement**: 15 MW+ capacity with 200m+ rotor diameters
    - **Capacity Factor**: Modern turbines achieve 35-45% efficiency
    </content>

    ### Offshore Wind Development
    <content>
    - **Floating Platforms**: Access to deeper waters and stronger winds
    - **Global Growth**: 35 GW planned installations by 2030
    </content>

    ## Energy Storage Solutions
    ### Battery Technology
    <content>
    - **Lithium-ion Improvements**: 90% cost reduction since 2010
    - **Grid-scale Storage**: Tesla Megapack, Fluence systems
    - **Duration Expansion**: 4-8 hour storage becoming standard
    </content>

    ### Alternative Storage
    <content>
    - **Pumped Hydro**: 95% of global storage capacity
    - **Compressed Air**: Long-duration storage for grid stability
    </content>

    ## Policy & Economics
    ### Government Initiatives
    <content>
    - **Renewable Targets**: 195 countries with renewable energy goals
    - **Carbon Pricing**: $95/ton CO2 in EU ETS (2023)
    </content>

    ### Market Dynamics
    <content>
    - **Investment Flows**: $1.8T in clean energy (2023) [IEA](https://iea.org/reports/world-energy-outlook-2023)
    - **Job Creation**: 13.7M renewable energy jobs globally
    </content>
    </example_lite>
  `
} as const;

export const PROMPT_GUIDANCE = {
  structure: `
    <structure_guidance>
    - Start with a clear, descriptive title using a single # header
    - Create 4-7 main sections using ## headers for comprehensive coverage
    - Add 2-4 subsections under each main topic using ### headers
    - Maintain parallel structure and consistent depth across all branches
    - Use bullet points for detailed information under each subsection
    </structure_guidance>
  `,
  content: `
    <content_guidance>
    - Include specific data, statistics, and quantifiable metrics with sources
    - Provide recent examples, case studies, and real-world applications
    - Balance technical depth with accessibility for the intended audience
    - Incorporate both current trends and foundational concepts
    - Ensure all claims are supported by credible sources and links
    </content_guidance>
  `,
  formatting: `
    <formatting_guidance>
    - Use **bold** for key terms, important concepts, and emphasis
    - Use *italics* for definitions, foreign terms, and subtle emphasis
    - Use \`code formatting\` for technical terms, APIs, and tools
    - Include relevant links with descriptive anchor text [text](URL)
    - Use > for important quotes or key insights when appropriate
    </formatting_guidance>
  `,
  quality: `
    <quality_guidance>
    - Verify all information is current and accurate
    - Ensure comprehensive coverage without overwhelming detail
    - Maintain logical flow and clear connections between sections
    - Include actionable insights and practical applications
    - Review for consistency in terminology and formatting
    </quality_guidance>
  `
} as const;