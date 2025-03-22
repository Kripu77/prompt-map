import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates a human-readable title from a prompt string
 * Removes markdown formatting and truncates if necessary
 */
export function generateTitleFromPrompt(userPrompt: string): string {
  if (!userPrompt) return "Mind Map";
  
  // Remove any markdown formatting
  const cleanPrompt = userPrompt.replace(/[#*_~`]/g, '');
  
  // Get the first sentence or up to 50 characters
  const title = cleanPrompt.split(/[.!?]/)[0].trim();
  if (title.length <= 50) return title;
  
  // If longer than 50 chars, truncate and add ellipsis
  return title.substring(0, 47) + '...';
}
