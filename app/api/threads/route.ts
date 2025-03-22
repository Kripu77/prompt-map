import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { conversations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // Fetch conversations for this user
    const userThreads = await db.query.conversations.findMany({
      where: eq(conversations.userId, userId),
      orderBy: (conversations, { desc }) => [desc(conversations.updatedAt)],
    });
    
    return NextResponse.json({ threads: userThreads });
  } catch (error) {
    console.error("Error fetching threads:", error);
    return NextResponse.json(
      { error: "Failed to fetch threads" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { title, content } = await request.json();
    
    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }
    
    const userId = session.user.id;
    
    // Generate unique ID
    const id = crypto.randomUUID();
    
    // Save the conversation
    const newThread = await db
      .insert(conversations)
      .values({
        id,
        userId,
        title,
        content,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    
    return NextResponse.json({ thread: newThread[0] });
  } catch (error) {
    console.error("Error creating thread:", error);
    return NextResponse.json(
      { error: "Failed to create thread" },
      { status: 500 }
    );
  }
} 