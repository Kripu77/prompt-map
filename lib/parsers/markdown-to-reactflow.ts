import { Node, Edge, MarkerType } from '@xyflow/react';

export interface TreeNode {
  id: string;
  content: string;
  level: number;
  children: TreeNode[];
}

export interface ReactFlowData {
  nodes: Node[];
  edges: Edge[];
}

export function parseMarkdownToTree(markdown: string): TreeNode {
  if (!markdown?.trim()) {
    return {
      id: 'root',
      content: 'Empty mindmap',
      level: 0,
      children: []
    };
  }

  const lines = markdown.split('\n');
  const stack: TreeNode[] = [];
  let nodeCounter = 0;

  const createNode = (content: string, level: number): TreeNode => ({
    id: `node-${++nodeCounter}`,
    content: content.replace(/^#+\s*/, '').trim(),
    level,
    children: []
  });

  let root: TreeNode | null = null;
  let currentContent: string[] = [];
  let inCodeBlock = false;
  let codeBlockLanguage = '';

  const processAccumulatedContent = (parentNode: TreeNode) => {
    if (currentContent.length === 0) return;

    const content = currentContent.join('\n').trim();
    if (!content) return;

    // Create a content node for non-header content
    const contentNode = createNode(content, parentNode.level + 1);
    parentNode.children.push(contentNode);
    currentContent = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // Handle code blocks
    if (trimmedLine.startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeBlockLanguage = trimmedLine.substring(3).trim();
        currentContent.push(line);
      } else {
        inCodeBlock = false;
        currentContent.push(line);
        codeBlockLanguage = '';
      }
      continue;
    }

    if (inCodeBlock) {
      currentContent.push(line);
      continue;
    }

    // Check for horizontal rules (lines with only dashes, underscores, or asterisks)
    const isHorizontalRule = /^[-_*]{3,}$/.test(trimmedLine);
    
    // Check for headers
    const headerMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/);
    
    if (headerMatch) {
      // Process any accumulated content before creating the header node
      if (stack.length > 0) {
        processAccumulatedContent(stack[stack.length - 1]);
      }

      const level = headerMatch[1].length;
      const content = headerMatch[2];
      const node = createNode(content, level);

      if (level === 1) {
        if (!root) {
          root = node;
          stack.length = 0;
          stack.push(root);
        } else {
          root.children.push(node);
          stack.length = 1;
          stack.push(node);
        }
      } else {
        while (stack.length > 0 && stack[stack.length - 1].level >= level) {
          stack.pop();
        }

        if (stack.length > 0) {
          stack[stack.length - 1].children.push(node);
          stack.push(node);
        }
      }
    } else if (trimmedLine && !isHorizontalRule) {
      // Accumulate non-header content (excluding horizontal rules)
      currentContent.push(line);
    } else if (currentContent.length > 0) {
      // Empty line - might be end of a content block
      currentContent.push(line);
    }
  }

  // Process any remaining accumulated content
  if (stack.length > 0 && currentContent.length > 0) {
    processAccumulatedContent(stack[stack.length - 1]);
  }

  return root || createNode('Empty mindmap', 1);
}

export function treeToReactFlow(tree: TreeNode): ReactFlowData {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const traverse = (node: TreeNode, parentId?: string) => {
    const hasChildren = node.children.length > 0;
    let nodeType = 'leaf';
    
    if (node.level === 1) nodeType = 'root';
    else if (hasChildren) nodeType = 'branch';

    nodes.push({
      id: node.id,
      type: nodeType,
      position: { x: 0, y: 0 },
      data: {
        content: node.content,
        level: node.level,
        hasChildren,
        children: node.children
      },
      width: nodeType === 'root' ? 300 : nodeType === 'branch' ? 250 : 200,
      height: nodeType === 'root' ? 120 : nodeType === 'branch' ? 100 : 80,
    });

    if (parentId) {
      edges.push({
        id: `${parentId}-${node.id}`,
        source: parentId,
        target: node.id,
        type: 'default',
        style: {
          stroke: getEdgeColor(node.level),
          strokeWidth: Math.max(4 - node.level, 1),
          strokeDasharray: node.level > 2 ? '5,5' : 'none',
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: getEdgeColor(node.level),
        },
      });
    }

    node.children.forEach(child => traverse(child, node.id));
  };

  traverse(tree);
  return { nodes, edges };
}

const getEdgeColor = (level: number): string => {
  const colors = ['#667eea', '#f093fb', '#4facfe', '#a8edea'];
  return colors[Math.min(level - 1, colors.length - 1)];
};