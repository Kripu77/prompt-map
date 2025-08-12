import { Node, Edge } from '@xyflow/react';
import { NodeData } from '../../components/features/mindmap/types';
import { calculateNodeDimensions, getNodeType } from './node-dimensions';
import { EDGE_STYLES } from '../../components/features/mindmap/constants';

export function generateVisibleNodesAndEdges(
  tree: unknown, 
  renderedNodeIds: Set<string>,
  onToggle: (id: string) => void
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
      visibleEdges.push({
        id: `${parentId}-${typedNode.id}`,
        source: parentId,
        target: typedNode.id,
        type: 'bezier',
        animated: true,
        style: {
          stroke: EDGE_STYLES.DEFAULT.stroke,
          strokeWidth: Math.max(
            EDGE_STYLES.DEFAULT.strokeWidth - typedNode.level * EDGE_STYLES.DYNAMIC_WIDTH_FACTOR, 
            EDGE_STYLES.MIN_WIDTH
          ),
          strokeDasharray: EDGE_STYLES.DEFAULT.strokeDasharray,
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