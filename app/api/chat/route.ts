import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const openrouter = createOpenRouter({
    apiKey: `${process.env.OPENROUTER_API_KEY}`,
  });

  const { text } = await generateText({
    model: openrouter("openai/gpt-3.5-turbo"),
    prompt: `Please generate a markdown-formatted mind map for the following topic: ${prompt}. 
    Use only markdown headers with # for main topics, ## for subtopics, and ### for details.
    For example:
    # Main Topic
    ## Subtopic 1
    ### Detail 1
    ### Detail 2
    ## Subtopic 2
    ### Detail 3
    
    Please generate a comprehensive mind map with at least 5 main topics and relevant subtopics.`,
  });

  return NextResponse.json({
    role: "assistant",
    content: text,
    id: Date.now().toString(),
  });
}
