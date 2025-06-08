import { HierarchicalNode } from '../types';

/**
 * Parses markdown text into a hierarchical structure for mindmap rendering
 */
export function parseMarkdownToHierarchy(markdown: string): HierarchicalNode {
  const lines = markdown.trim().split('\n').filter(line => line.trim());
  
  const root: HierarchicalNode = {
    id: 'root',
    label: 'Mind Map',
    children: []
  };
  
  const stack: { node: HierarchicalNode; level: number }[] = [{ node: root, level: -1 }];
  let nodeCounter = 0;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('export') || trimmedLine.startsWith('`')) {
      continue;
    }
    
    // Determine the level based on markdown syntax
    let level = 0;
    let content = trimmedLine;
    
    // Handle headers (# ## ###)
    if (trimmedLine.startsWith('#')) {
      const headerMatch = trimmedLine.match(/^(#+)\s*(.*)/);
      if (headerMatch) {
        level = headerMatch[1].length - 1; // Convert to 0-based level
        content = headerMatch[2].trim();
        // Remove any remaining # symbols from the content
        content = content.replace(/^#+\s*/, '').trim();
      }
    }
    // Handle list items (- or *)
    else if (trimmedLine.startsWith('-') || trimmedLine.startsWith('*')) {
      // Count leading spaces to determine nesting level
      const leadingSpaces = line.length - line.trimStart().length;
      level = Math.floor(leadingSpaces / 2) + 1; // Base level for list items
      content = trimmedLine.replace(/^[-*]\s*/, '').trim();
      // Remove any ### or ## symbols that might be in list items
      content = content.replace(/^#+\s*/, '').trim();
    }
    else {
      continue; // Skip lines that don't match our patterns
    }
    
    // Clean up content (remove extra formatting and normalize spaces)
    content = content.replace(/\s+/g, ' ').trim();
    
    if (!content) continue;
    
    // Find the appropriate parent
    while (stack.length > 1 && stack[stack.length - 1].level >= level) {
      stack.pop();
    }
    
    const parent = stack[stack.length - 1].node;
    
    // Create new node
    const newNode: HierarchicalNode = {
      id: `node-${nodeCounter++}`,
      label: content,
      children: []
    };
    
    // Add to parent
    if (!parent.children) {
      parent.children = [];
    }
    parent.children.push(newNode);
    
    // Add to stack
    stack.push({ node: newNode, level });
  }
  
  // If root has only one child, use that child as the actual root
  if (root.children && root.children.length === 1) {
    const actualRoot = root.children[0];
    actualRoot.id = 'root';
    return actualRoot;
  }
  
  return root;
}

/**
 * Generates dynamic branch colors based on the number of main branches
 */
export function generateBranchColors(hierarchicalData: HierarchicalNode): { [key: string]: { primary: string; gradient: string; light: string } } {
  const colors = [
    { primary: '#3b82f6', gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', light: '#3b82f6aa' },
    { primary: '#ef4444', gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', light: '#ef4444aa' },
    { primary: '#10b981', gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', light: '#10b981aa' },
    { primary: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', light: '#f59e0baa' },
    { primary: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', light: '#8b5cf6aa' },
    { primary: '#06b6d4', gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)', light: '#06b6d4aa' },
    { primary: '#f97316', gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', light: '#f97316aa' },
    { primary: '#ec4899', gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)', light: '#ec4899aa' }
  ];
  
  const branchColors: { [key: string]: { primary: string; gradient: string; light: string } } = {};
  
  if (hierarchicalData.children) {
    hierarchicalData.children.forEach((child, index) => {
      const colorIndex = index % colors.length;
      branchColors[child.id] = colors[colorIndex];
    });
  }
  
  return branchColors;
}