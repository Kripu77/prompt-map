import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extracts the root topic (main title) from the mindmap markdown content
 * Falls back to the prompt if the root topic can't be found
 * Ensures the title doesn't exceed 200 characters for API validation
 */
export function extractMindmapTitle(mindmapContent: string | null): string | null {
  if (!mindmapContent) return null;
  
  // Find the first level-1 header (# Title) in the markdown
  const rootTopicMatch = mindmapContent.match(/^# (.+)$/m);
  if (rootTopicMatch && rootTopicMatch[1]) {
    const title = rootTopicMatch[1].trim();
    
    // Ensure title doesn't exceed 200 characters (API validation limit)
    if (title.length > 200) {
      return title.substring(0, 197) + '...';
    }
    
    return title;
  }
  
  return null;
}

/**
 * Generates a human-readable title from a prompt string and mindmap content
 * Prioritizes extracting the title from the mindmap content first
 * Ensures the title doesn't exceed 200 characters for API validation
 */
export function generateTitleFromPrompt(userPrompt: string, mindmapContent?: string | null): string {
  // Try to extract title from mindmap content first
  if (mindmapContent) {
    const extractedTitle = extractMindmapTitle(mindmapContent);
    if (extractedTitle) return extractedTitle;
  }
  
  if (!userPrompt) return "Mind Map";
  
  // Clean up the prompt if we couldn't extract a title from the mindmap
  // Remove any markdown formatting
  const cleanPrompt = userPrompt.replace(/[#*_~`]/g, '');
  
  // Get the first sentence or up to 50 characters
  const title = cleanPrompt.split(/[.!?]/)[0].trim();
  
  // Ensure title doesn't exceed 200 characters (API validation limit)
  if (title.length > 200) {
    return title.substring(0, 197) + '...';
  }
  
  if (title.length <= 50) return title;
  
  // If longer than 50 chars but less than 200, truncate and add ellipsis
  return title.substring(0, 47) + '...';
}
