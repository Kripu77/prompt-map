import { Node, Edge } from '@xyflow/react';
import { NodeData } from '../../components/features/mindmap/types';
import { calculateNodeDimensions, getNodeType } from './node-dimensions';

type TreeNode = {
  id: string;
  content: string;
  level: number;
  children?: unknown[];
};

const isValidNode = (node: unknown): node is TreeNode => {
  return (
    node !== null &&
    typeof node === 'object' &&
    'id' in node &&
    'content' in node &&
    'level' in node
  );
};

const createNodeData = (
  node: TreeNode,
  hasChildren: boolean,
  onToggle: (id: string) => void
): Node => {
  const nodeType = getNodeType(node.level, hasChildren);
  const { width, height } = calculateNodeDimensions(node.content, nodeType);

  return {
    id: node.id,
    type: nodeType,
    position: { x: 0, y: 0 },
    data: {
      content: node.content,
      level: node.level,
      hasChildren,
      children: node.children,
      expanded: true,
      onToggle,
      isNewlyRendered: true,
    } as NodeData,
    width,
    height,
  };
};

const createEdge = (parentId: string, nodeId: string): Edge => ({
  id: `${parentId}-${nodeId}`,
  source: parentId,
  target: nodeId,
  animated: true,
});

export const generateVisibleNodesAndEdges = (
  tree: unknown,
  renderedNodeIds: Set<string>,
  onToggle: (id: string) => void
): { nodes: Node[]; edges: Edge[] } => {
  if (!tree) return { nodes: [], edges: [] };

  const visibleNodes: Node[] = [];
  const visibleEdges: Edge[] = [];

  const traverse = (node: unknown, parentId?: string): void => {
    if (!isValidNode(node) || !renderedNodeIds.has(node.id)) return;

    const hasChildren = Boolean(node.children?.length);
    visibleNodes.push(createNodeData(node, hasChildren, onToggle));

    if (parentId && renderedNodeIds.has(parentId)) {
      visibleEdges.push(createEdge(parentId, node.id));
    }

    if (hasChildren && node.children) {
      node.children.forEach((child) => traverse(child, node.id));
    }
  };

  traverse(tree);
  return { nodes: visibleNodes, edges: visibleEdges };
};