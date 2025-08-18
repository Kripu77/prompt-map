import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

const MAX_TITLE_LENGTH = 200;
const TRUNCATION_SUFFIX = '...';
const TRUNCATION_OFFSET = 3;
const DEFAULT_TITLE = "Mind Map";
const SHORT_TITLE_THRESHOLD = 50;
const MARKDOWN_PATTERN = /[#*_~`]/g;
const SENTENCE_DELIMITERS = /[.!?]/;
const HEADER_PATTERN = /^# (.+)$/m;

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs))
}

const truncateWithEllipsis = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - TRUNCATION_OFFSET) + TRUNCATION_SUFFIX;
};

const cleanMarkdownFormatting = (text: string): string => {
  return text.replace(MARKDOWN_PATTERN, '');
};

const extractFirstSentence = (text: string): string => {
  return text.split(SENTENCE_DELIMITERS)[0].trim();
};

const validateTitleLength = (title: string): string => {
  return truncateWithEllipsis(title, MAX_TITLE_LENGTH);
};

export const extractMindmapTitle = (mindmapContent: string | null): string | null => {
  if (!mindmapContent) return null;
  
  const rootTopicMatch = mindmapContent.match(HEADER_PATTERN);
  if (rootTopicMatch && rootTopicMatch[1]) {
    const title = rootTopicMatch[1].trim();
    return validateTitleLength(title);
  }
  
  return null;
};

export const generateTitleFromPrompt = (userPrompt: string, mindmapContent?: string | null): string => {
  if (mindmapContent) {
    const extractedTitle = extractMindmapTitle(mindmapContent);
    if (extractedTitle) return extractedTitle;
  }
  
  if (!userPrompt) return DEFAULT_TITLE;
  
  const cleanPrompt = cleanMarkdownFormatting(userPrompt);
  const firstSentence = extractFirstSentence(cleanPrompt);
  const validatedTitle = validateTitleLength(firstSentence);
  
  if (validatedTitle.length <= SHORT_TITLE_THRESHOLD) {
    return validatedTitle;
  }
  
  return truncateWithEllipsis(validatedTitle, SHORT_TITLE_THRESHOLD);
};
