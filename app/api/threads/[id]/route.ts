import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { conversations } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

export async function GET(
  _: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = session.user.id;
    const threadId = params.id;
    
    // Fetch the specific thread and ensure it belongs to the user
    const thread = await db.query.conversations.findFirst({
      where: and(
        eq(conversations.id, threadId),
        eq(conversations.userId, userId)
      ),
    });
    
    if (!thread) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }
    
    return NextResponse.json({ thread });
  } catch (error) {
    console.error("Error fetching thread:", error);
    return NextResponse.json(
      { error: "Failed to fetch thread" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = session.user.id;
    const threadId = params.id;
    
    // Check if thread exists and belongs to user
    const existingThread = await db.query.conversations.findFirst({
      where: and(
        eq(conversations.id, threadId),
        eq(conversations.userId, userId)
      ),
    });
    
    if (!existingThread) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }
    
    const { title, content } = await request.json();
    
    if (!title && !content) {
      return NextResponse.json(
        { error: "No updates provided" },
        { status: 400 }
      );
    }
    
    // Update the thread
    const updatedThread = await db
      .update(conversations)
      .set({
        ...(title && { title }),
        ...(content && { content }),
        updatedAt: new Date(),
      })
      .where(eq(conversations.id, threadId))
      .returning();
    
    return NextResponse.json({ thread: updatedThread[0] });
  } catch (error) {
    console.error("Error updating thread:", error);
    return NextResponse.json(
      { error: "Failed to update thread" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = session.user.id;
    const threadId = params.id;
    
    // Check if thread exists and belongs to user
    const existingThread = await db.query.conversations.findFirst({
      where: and(
        eq(conversations.id, threadId),
        eq(conversations.userId, userId)
      ),
    });
    
    if (!existingThread) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }
    
    // Delete the thread
    await db
      .delete(conversations)
      .where(eq(conversations.id, threadId));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting thread:", error);
    return NextResponse.json(
      { error: "Failed to delete thread" },
      { status: 500 }
    );
  }
} 