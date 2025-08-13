import { NODE_DIMENSIONS } from '../../components/features/mindmap/constants';
import { NodeDimensions } from '../../components/features/mindmap/types';

// Helper function to estimate text width based on content type and node type
function estimateTextWidth(text: string, nodeType: 'root' | 'branch' | 'leaf'): number {
  // Get width multiplier from constants for consistency
  const config = NODE_DIMENSIONS[nodeType.toUpperCase() as keyof typeof NODE_DIMENSIONS];
  const baseMultiplier = config.WIDTH_MULTIPLIER;
  
  let maxLineWidth = 0;
  const lines = text.split('\n').filter(line => line.trim() !== '');
  
  // If no content, return a base width
  if (lines.length === 0) {
    return config.MIN_WIDTH * 0.8;
  }
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    let lineWidth = 0;
    
    // Check for markdown headers and adjust multiplier
    if (trimmedLine.startsWith('# ')) {
      lineWidth = (trimmedLine.length - 2) * (baseMultiplier * 1.5); // h1 is larger
    } else if (trimmedLine.startsWith('## ')) {
      lineWidth = (trimmedLine.length - 3) * (baseMultiplier * 1.4); // h2
    } else if (trimmedLine.startsWith('### ')) {
      lineWidth = (trimmedLine.length - 4) * (baseMultiplier * 1.3); // h3
    } else if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
      lineWidth = (trimmedLine.length - 4) * (baseMultiplier * 1.2); // bold text
    } else if (trimmedLine.includes('`')) {
      // Code blocks or inline code - typically wider
      lineWidth = trimmedLine.length * (baseMultiplier * 1.25);
    } else {
      // Regular text - use full multiplier for better sizing
      lineWidth = trimmedLine.length * baseMultiplier;
    }
    
    maxLineWidth = Math.max(maxLineWidth, lineWidth);
  }
  
  // Add some base width for very short content
  return Math.max(maxLineWidth, config.MIN_WIDTH * 0.6);
}

// Helper function to estimate text height based on content
function estimateTextHeight(text: string, nodeType: 'root' | 'branch' | 'leaf'): number {
  const lines = text.split('\n').filter(line => line.trim() !== '');
  
  // Base line height for different node types
  const baseLineHeights = {
    root: 28,    // text-lg line height
    branch: 20,  // text-sm line height
    leaf: 16     // text-xs line height
  };
  
  let totalHeight = 0;
  
  for (const line of lines) {
    let lineHeight = baseLineHeights[nodeType];
    
    // Adjust for different markdown elements
    if (line.startsWith('# ')) {
      lineHeight = baseLineHeights[nodeType] * 1.5; // h1 is taller
    } else if (line.startsWith('## ')) {
      lineHeight = baseLineHeights[nodeType] * 1.4; // h2
    } else if (line.startsWith('### ')) {
      lineHeight = baseLineHeights[nodeType] * 1.3; // h3
    } else if (line.includes('```')) {
      lineHeight = baseLineHeights[nodeType] * 1.2; // code blocks need more space
    }
    
    totalHeight += lineHeight;
  }
  
  // Add some base height if no content
  return Math.max(totalHeight, baseLineHeights[nodeType]);
}

export function calculateNodeDimensions(
  content: string,
  nodeType: 'root' | 'branch' | 'leaf'
): NodeDimensions {
  const config = NODE_DIMENSIONS[nodeType.toUpperCase() as keyof typeof NODE_DIMENSIONS];
  
  // Calculate dynamic width based on content
  const estimatedWidth = estimateTextWidth(content, nodeType);
  
  // Apply width bounds to prevent excessive growth or shrinkage
  const width = Math.max(
    config.MIN_WIDTH,
    Math.min(config.MAX_WIDTH, estimatedWidth + config.PADDING)
  );
  
  // Calculate dynamic height based on content
  const estimatedHeight = estimateTextHeight(content, nodeType);
  
  // Apply height bounds to prevent excessive growth or shrinkage
  const height = Math.max(
    config.MIN_HEIGHT,
    Math.min(config.MAX_HEIGHT, estimatedHeight + config.LINE_PADDING)
  );
  
  return { width, height };
}

export function getNodeType(level: number, hasChildren: boolean): 'root' | 'branch' | 'leaf' {
  if (level === 1) return 'root';
  if (hasChildren) return 'branch';
  return 'leaf';
}