import { db } from '@/lib/db';
import { anonymousMindmaps } from '@/lib/db/schema';
import type { AnonymousMindmapData } from '@/types/api';

export class AnalyticsService {
  async recordAnonymousMindmap(data: AnonymousMindmapData): Promise<void> {
    try {
      const id = crypto.randomUUID();
      
      await db
        .insert(anonymousMindmaps)
        .values({
          id,
          sessionId: data.sessionId || crypto.randomUUID(),
          prompt: data.prompt,
          title: data.title || 'Untitled',
          content: data.content,
          createdAt: new Date(),
          userAgent: data.userAgent,
          referrer: data.referrer,
        });
    } catch (error) {
      throw new Error(`Failed to record analytics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getAnalyticsStats(): Promise<{
    totalMindmaps: number;
    uniqueSessions: number;
    topPrompts: Array<{ prompt: string; count: number }>;
  }> {
    try {
      // TODO KK: Add more complex setup
      // For now, return basic stats
      const totalMindmaps = await db.$count(anonymousMindmaps);
      
      return {
        totalMindmaps,
        uniqueSessions: 0, 
        topPrompts: [], 
      };
    } catch (error) {
      throw new Error(`Failed to get analytics stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const analyticsService = new AnalyticsService();