import { NODE_DIMENSIONS } from '../../components/features/mindmap/constants';
import { NodeDimensions } from '../../components/features/mindmap/types';

// Helper function to estimate text width based on content type and node type
function estimateTextWidth(text: string, nodeType: 'root' | 'branch' | 'leaf'): number {
  // Base character width multipliers for different node types (accounting for font sizes)
  const baseMultipliers = {
    root: 12,    // text-lg font size
    branch: 8,   // text-sm font size  
    leaf: 7      // text-xs font size
  };
  
  let totalWidth = 0;
  const lines = text.split('\n');
  
  for (const line of lines) {
    let lineWidth = 0;
    
    // Check for markdown headers and adjust multiplier
    if (line.startsWith('# ')) {
      lineWidth = (line.length - 2) * (baseMultipliers[nodeType] * 1.4); // h1 is larger
    } else if (line.startsWith('## ')) {
      lineWidth = (line.length - 3) * (baseMultipliers[nodeType] * 1.3); // h2
    } else if (line.startsWith('### ')) {
      lineWidth = (line.length - 4) * (baseMultipliers[nodeType] * 1.2); // h3
    } else if (line.startsWith('**') && line.endsWith('**')) {
      lineWidth = (line.length - 4) * (baseMultipliers[nodeType] * 1.1); // bold text
    } else if (line.includes('`')) {
      // Code blocks or inline code - typically wider
      lineWidth = line.length * (baseMultipliers[nodeType] * 1.15);
    } else {
      // Regular text
      lineWidth = line.length * baseMultipliers[nodeType];
    }
    
    totalWidth = Math.max(totalWidth, lineWidth);
  }
  
  return totalWidth;
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
  
  // Use improved text estimation
  const estimatedWidth = estimateTextWidth(content, nodeType);
  const estimatedHeight = estimateTextHeight(content, nodeType);
  
  // Apply bounds with the estimated dimensions
  const width = Math.max(
    config.MIN_WIDTH,
    Math.min(config.MAX_WIDTH, estimatedWidth + config.PADDING)
  );
  
  const height = Math.max(
    config.MIN_HEIGHT,
    estimatedHeight + config.LINE_PADDING
  );
  
  return { width, height };
}

export function getNodeType(level: number, hasChildren: boolean): 'root' | 'branch' | 'leaf' {
  if (level === 1) return 'root';
  if (hasChildren) return 'branch';
  return 'leaf';
}