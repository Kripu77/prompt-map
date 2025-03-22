import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { anonymousMindmaps } from "@/lib/db/schema";

export async function POST(request: NextRequest) {
  try {
    const { prompt, title, content, sessionId, userAgent, referrer } = await request.json();
    
    if (!prompt || !content) {
      return NextResponse.json(
        { error: "Prompt and content are required" },
        { status: 400 }
      );
    }
    
    // Generate unique ID
    const id = crypto.randomUUID();
    
    // Get user agent and referrer from request headers if not provided
    const userAgentFromHeader = request.headers.get('user-agent') || undefined;
    const referrerFromHeader = request.headers.get('referer') || undefined;
    
    // Save the anonymous mindmap data
    await db
      .insert(anonymousMindmaps)
      .values({
        id,
        sessionId: sessionId || crypto.randomUUID(), // Use provided sessionId or generate one
        prompt,
        title: title || "Untitled", // Default title if not provided
        content,
        createdAt: new Date(),
        userAgent: userAgent || userAgentFromHeader,
        referrer: referrer || referrerFromHeader
      })
      .returning();
    
    return NextResponse.json({ 
      success: true,
      message: "Anonymous data collected for analytics"
    });
  } catch (error) {
    console.error("Error saving anonymous mindmap data:", error);
    return NextResponse.json(
      { error: "Failed to save analytics data" },
      { status: 500 }
    );
  }
} 