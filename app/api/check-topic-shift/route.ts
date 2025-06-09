import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { prompt, context } = body;

  // If there's no context or not a follow-up, no need to check for topic shift
  if (!context || !context.isFollowUp || !context.existingMindmap || !context.checkTopicShift) {
    return NextResponse.json({
      isTopicShift: false
    });
  }

  // Extract the first line which should be the # Title
  const currentTopicMatch = context.existingMindmap.match(/^# (.+)$/m);
  const currentTopic = currentTopicMatch ? currentTopicMatch[1].trim() : '';

  if (!currentTopic) {
    return NextResponse.json({
      isTopicShift: false // Can't determine without a topic
    });
  }

  const openrouter = createOpenRouter({
    apiKey: `${process.env.OPENROUTER_API_KEY}`,
  });

  // Prepare the prompt to detect topic shift
  const promptTemplate = `You are an AI assistant that helps determine if a follow-up question is related to a given topic.

Current mindmap topic: "${currentTopic}"

Original prompt that created this mindmap: "${context.originalPrompt}"

Follow-up question from user: "${prompt}"

Analyze whether this follow-up question represents a significant topic shift from the current mindmap topic.

A topic shift means the question is about a completely different subject that would NOT make sense to include in the current mindmap.

Examples:
- If current topic is "Clean Code Best Practices" and follow-up is "Tell me more about testing" - NOT a topic shift
- If current topic is "Clean Code Best Practices" and follow-up is "Investment strategies for retirement" - IS a topic shift

Please respond with JSON in this exact format only: {"isTopicShift": true/false, "explanation": "brief reason"}.
Do not include any other text in your response.`;

  try {
    const { text } = await generateText({
      model: openrouter("deepseek/deepseek-r1-0528:free"),
      prompt: promptTemplate,
    });

    // Parse the JSON response
    try {
      const jsonResponse = JSON.parse(text.trim());
      return NextResponse.json({
        isTopicShift: jsonResponse.isTopicShift,
        explanation: jsonResponse.explanation
      });
    } catch (parseError) {
      console.error("Error parsing topic shift response:", parseError);
      // Default to false if parsing fails
      return NextResponse.json({
        isTopicShift: false,
        explanation: "Failed to determine topic relevance"
      });
    }
  } catch (error) {
    console.error("Error checking topic shift:", error);
    // In case of any error, default to false to allow the request to proceed
    return NextResponse.json({
      isTopicShift: false,
      explanation: "Error processing request"
    });
  }
} 