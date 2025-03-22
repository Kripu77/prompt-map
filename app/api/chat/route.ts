import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { prompt, context } = body;

  const openrouter = createOpenRouter({
    apiKey: `${process.env.OPENROUTER_API_KEY}`,
  });

  let promptTemplate: string;

  // Handle follow-up prompts differently from initial prompts
  if (context && context.isFollowUp && context.existingMindmap) {
    // This is a follow-up prompt - modify the existing mindmap
    promptTemplate = `You have previously generated a mind map about "${context.originalPrompt}" with the following markdown structure:

${context.existingMindmap}

Now, the user is asking this follow-up question: "${prompt}"

Please analyze the question and appropriately modify the mind map to address the follow-up. You can:
1. Add new sections/topics
2. Expand existing topics with more subtopics
3. Remove or reorganize topics that are no longer relevant
4. Refine existing content

Make sure to keep the first line (# Title) as a meaningful title that represents the main topic of the mind map.
It should clearly communicate what the mind map is about, not be generic like "Core Ideas".

Generate a complete, updated markdown-formatted mind map that incorporates this follow-up question.
Use only markdown headers with # for main topics, ## for subtopics, and ### for details.
Previous prompts from the user include: ${context.previousPrompts.join(", ")}

Return the entire updated mind map.`;
  } else {
    // This is an initial prompt - create a new mindmap
    promptTemplate = `Please generate a markdown-formatted mind map for the following topic: ${prompt}. 
    Use only markdown headers with # for main topics, ## for subtopics, and ### for details.
    
    Follow these formatting guidelines:
    1. The FIRST line must be a single level-1 header (# Title) that serves as the main topic/title.
       This title should be descriptive and specific to the content (not generic like "Mind Map").
    2. Then use level-2 headers (## Subtopic) for main branches.
    3. Use level-3 headers (### Detail) for details/sub-branches.
    
    Example:
    # Comprehensive Guide to Machine Learning
    ## Supervised Learning
    ### Classification Algorithms
    ### Regression Techniques
    ## Unsupervised Learning
    ### Clustering Methods
    
    Please generate a comprehensive mind map with at least 5 main topics and relevant subtopics.
    The title should clearly communicate what the mind map is about.`;
  }

  const { text } = await generateText({
    model: openrouter("openai/gpt-3.5-turbo"),
    prompt: promptTemplate,
  });

  return NextResponse.json({
    role: "assistant",
    content: text,
    id: Date.now().toString(),
  });
}
