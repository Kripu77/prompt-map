import { Node, Edge } from '@xyflow/react';
import { NodeData } from '../../components/features/mindmap/types';
import { calculateNodeDimensions, getNodeType } from './node-dimensions';
import { EDGE_STYLES } from '../../components/features/mindmap/constants';

// Helper function to get hierarchical edge color based on level and theme
function getHierarchicalEdgeColor(level: number, isDark: boolean = false): string {
  const colorScheme = isDark ? EDGE_STYLES.HIERARCHICAL_COLORS.DARK : EDGE_STYLES.HIERARCHICAL_COLORS.LIGHT;
  return colorScheme[level as keyof typeof colorScheme] || colorScheme.DEFAULT;
}

// Helper function to get edge width based on level
function getHierarchicalEdgeWidth(level: number): number {
  const baseWidth = EDGE_STYLES.MAX_WIDTH;
  const calculatedWidth = Math.max(
    baseWidth - level * EDGE_STYLES.DYNAMIC_WIDTH_FACTOR,
    EDGE_STYLES.MIN_WIDTH
  );
  return calculatedWidth;
}

// Helper function to get edge opacity based on level
function getHierarchicalEdgeOpacity(level: number): number {
  return Math.max(0.95 - level * 0.1, 0.6);
}

export function generateVisibleNodesAndEdges(
  tree: unknown, 
  renderedNodeIds: Set<string>,
  onToggle: (id: string) => void,
  isDarkMode: boolean = false
): { nodes: Node[], edges: Edge[] } {
  if (!tree) return { nodes: [], edges: [] };
  
  const visibleNodes: Node[] = [];
  const visibleEdges: Edge[] = [];

  const traverse = (node: unknown, parentId?: string) => {
    // Type guard to ensure node has required properties
    if (!node || typeof node !== 'object' || !('id' in node) || !('content' in node) || !('level' in node)) {
      return;
    }

    const typedNode = node as { 
      id: string; 
      content: string; 
      level: number; 
      children?: unknown[];
    };

    // Only render nodes that are in the renderedNodeIds set
    if (!renderedNodeIds.has(typedNode.id)) return;

    const hasChildren = Boolean(typedNode.children && typedNode.children.length > 0);
    const isExpanded = true; // Always expand all nodes
    const nodeType = getNodeType(typedNode.level, hasChildren);
    const { width, height } = calculateNodeDimensions(typedNode.content, nodeType);

    visibleNodes.push({
      id: typedNode.id,
      type: nodeType,
      position: { x: 0, y: 0 },
      data: {
        content: typedNode.content,
        level: typedNode.level,
        hasChildren,
        children: typedNode.children,
        expanded: isExpanded,
        onToggle,
        isNewlyRendered: true,
      } as NodeData,
      width,
      height,
    });

    // Only add edge if parent is also rendered
    if (parentId && renderedNodeIds.has(parentId)) {
      const edgeColor = getHierarchicalEdgeColor(typedNode.level, isDarkMode);
      const edgeWidth = getHierarchicalEdgeWidth(typedNode.level);
      const edgeOpacity = getHierarchicalEdgeOpacity(typedNode.level);
      const glowEffect = isDarkMode ? EDGE_STYLES.GLOW_EFFECTS.DARK : EDGE_STYLES.GLOW_EFFECTS.LIGHT;
      
      visibleEdges.push({
        id: `${parentId}-${typedNode.id}`,
        source: parentId,
        target: typedNode.id,
        type: 'bezier',
        animated: true,
        style: {
          stroke: edgeColor,
          strokeWidth: edgeWidth,
          strokeOpacity: edgeOpacity,
          strokeDasharray: typedNode.level === 0 ? 'none' : EDGE_STYLES.DEFAULT.strokeDasharray,
          filter: typedNode.level <= 2 ? glowEffect.filter : 'none', // Apply glow only to top levels
        },
        data: {
          level: typedNode.level,
          hierarchicalColor: edgeColor,
        },
      });
    }

    // Traverse children
    if (hasChildren && typedNode.children) {
      typedNode.children.forEach((child: unknown) => traverse(child, typedNode.id));
    }
  };

  traverse(tree);
  return { nodes: visibleNodes, edges: visibleEdges };
}