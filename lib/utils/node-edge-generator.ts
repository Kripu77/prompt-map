import { Node, Edge } from '@xyflow/react';
import { NodeData } from '../../components/features/mindmap/types';
import { calculateNodeDimensions, getNodeType } from './node-dimensions';
import { EDGE_STYLES } from '../../components/features/mindmap/constants';

export function generateVisibleNodesAndEdges(
  tree: any, 
  renderedNodeIds: Set<string>,
  onToggle: (id: string) => void
): { nodes: Node[], edges: Edge[] } {
  if (!tree) return { nodes: [], edges: [] };
  
  const visibleNodes: Node[] = [];
  const visibleEdges: Edge[] = [];

  const traverse = (node: any, parentId?: string) => {
    // Only render nodes that are in the renderedNodeIds set
    if (!renderedNodeIds.has(node.id)) return;

    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = true; // Always expand all nodes
    const nodeType = getNodeType(node.level, hasChildren);
    const { width, height } = calculateNodeDimensions(node.content, nodeType);

    visibleNodes.push({
      id: node.id,
      type: nodeType,
      position: { x: 0, y: 0 },
      data: {
        content: node.content,
        level: node.level,
        hasChildren,
        children: node.children,
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
        id: `${parentId}-${node.id}`,
        source: parentId,
        target: node.id,
        type: 'bezier',
        animated: true,
        style: {
          stroke: EDGE_STYLES.DEFAULT.stroke,
          strokeWidth: Math.max(
            EDGE_STYLES.DEFAULT.strokeWidth - node.level * EDGE_STYLES.DYNAMIC_WIDTH_FACTOR, 
            EDGE_STYLES.MIN_WIDTH
          ),
          strokeDasharray: EDGE_STYLES.DEFAULT.strokeDasharray,
        },
      });
    }

    // Traverse children
    if (hasChildren) {
      node.children.forEach((child: any) => traverse(child, node.id));
    }
  };

  traverse(tree);
  return { nodes: visibleNodes, edges: visibleEdges };
}