import { db } from '@/lib/db';
import { conversations } from '@/lib/db/schema';
import { and, eq, desc } from 'drizzle-orm';
import type { Thread, ThreadCreateRequest, ThreadUpdateRequest } from '@/types/api';

export class ThreadsService {
  async getThreads(userId: string): Promise<Thread[]> {
    try {
      const threads = await db.query.conversations.findMany({
        where: eq(conversations.userId, userId),
        orderBy: [desc(conversations.updatedAt)],
      });
      
      return threads.map(this.mapToThread);
    } catch (error) {
      throw new Error(`Failed to fetch threads: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getThread(id: string, userId: string): Promise<Thread | null> {
    try {
      const thread = await db.query.conversations.findFirst({
        where: and(
          eq(conversations.id, id),
          eq(conversations.userId, userId)
        ),
      });
      
      return thread ? this.mapToThread(thread) : null;
    } catch (error) {
      throw new Error(`Failed to fetch thread: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createThread(data: ThreadCreateRequest, userId: string): Promise<Thread> {
    try {
      const id = crypto.randomUUID();
      const now = new Date();
      
      const [newThread] = await db
        .insert(conversations)
        .values({
          id,
          userId,
          title: data.title,
          content: data.content,
          reasoning: data.reasoning || null,
          reasoningDuration: data.reasoningDuration || null,
          createdAt: now,
          updatedAt: now,
        })
        .returning();
      
      return this.mapToThread(newThread);
    } catch (error) {
      throw new Error(`Failed to create thread: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateThread(id: string, data: ThreadUpdateRequest, userId: string): Promise<Thread | null> {
    try {
      const existingThread = await this.getThread(id, userId);
      if (!existingThread) {
        return null;
      }

      const [updatedThread] = await db
        .update(conversations)
        .set({
          ...(data.title && { title: data.title }),
          ...(data.content && { content: data.content }),
          ...(data.reasoning !== undefined && { reasoning: data.reasoning }),
          ...(data.reasoningDuration !== undefined && { reasoningDuration: data.reasoningDuration }),
          updatedAt: new Date(),
        })
        .where(eq(conversations.id, id))
        .returning();
      
      return this.mapToThread(updatedThread);
    } catch (error) {
      throw new Error(`Failed to update thread: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteThread(id: string, userId: string): Promise<boolean> {
    try {
      const existingThread = await this.getThread(id, userId);
      if (!existingThread) {
        return false;
      }

      await db
        .delete(conversations)
        .where(eq(conversations.id, id));
      
      return true;
    } catch (error) {
      throw new Error(`Failed to delete thread: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private mapToThread(dbThread: {
    id: string;
    title: string;
    content: unknown;
    reasoning?: string | null;
    reasoningDuration?: number | null;
    userId: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): Thread {
    return {
      id: dbThread.id,
      title: dbThread.title,
      content: String(dbThread.content),
      reasoning: dbThread.reasoning || undefined,
      reasoningDuration: dbThread.reasoningDuration || undefined,
      userId: dbThread.userId || '',
      createdAt: dbThread.createdAt.toISOString(),
      updatedAt: dbThread.updatedAt.toISOString(),
    };
  }
}

export const threadsService = new ThreadsService();