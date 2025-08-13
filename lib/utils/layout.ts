import ELK from 'elkjs/lib/elk.bundled.js';
import { Node, Edge } from '@xyflow/react';
import { ELK_OPTIONS, LAYOUT_SPACING } from '../../components/features/mindmap/constants';

const elk = new ELK();

export async function layoutGraph(nodes: Node[], edges: Edge[]): Promise<Node[]> {
  if (nodes.length === 0) return nodes;
  
  // Calculate hierarchical depth and branching complexity
  const nodeDepthMap = new Map<string, number>();
  const nodeBranchingMap = new Map<string, number>();
  
  // Build depth and branching maps
  nodes.forEach(node => {
    const level = typeof node.data?.level === 'number' ? node.data.level : 1;
    const hasChildren = node.data?.hasChildren || false;
    const children = node.data?.children;
    const childrenCount = Array.isArray(children) ? children.length : 0;
    
    nodeDepthMap.set(node.id, level);
    nodeBranchingMap.set(node.id, hasChildren ? childrenCount : 0);
  });
  
  // Calculate maximum depth and branching factor
  const depthValues = Array.from(nodeDepthMap.values()).filter(v => typeof v === 'number');
  const branchingValues = Array.from(nodeBranchingMap.values()).filter(v => typeof v === 'number');
  const maxDepth = depthValues.length > 0 ? Math.max(...depthValues) : 1;
  const maxBranching = branchingValues.length > 0 ? Math.max(...branchingValues) : 0;
  
  // Calculate dynamic spacing based on node sizes and hierarchical complexity
  const avgNodeWidth = nodes.reduce((sum, node) => sum + (node.width || 200), 0) / nodes.length;
  const avgNodeHeight = nodes.reduce((sum, node) => sum + (node.height || 80), 0) / nodes.length;
  
  // Minimal multipliers for deeper hierarchies with sub-branches
  const depthMultiplier = Math.max(1, Math.pow(1.1, maxDepth - 1));
  const branchingMultiplier = Math.max(1, Math.pow(1.05, maxBranching));
  const complexityMultiplier = depthMultiplier * branchingMultiplier;
  
  const dynamicElkOptions = {
    ...ELK_OPTIONS,
    'elk.spacing.nodeNode': Math.max(
      LAYOUT_SPACING.MIN_NODE_SPACING * complexityMultiplier,
      avgNodeHeight * LAYOUT_SPACING.NODE_HEIGHT_FACTOR * complexityMultiplier
    ).toString(),
    'elk.layered.spacing.nodeNodeBetweenLayers': Math.max(
      LAYOUT_SPACING.MIN_LAYER_SPACING * complexityMultiplier,
      avgNodeWidth * LAYOUT_SPACING.NODE_WIDTH_FACTOR * complexityMultiplier
    ).toString(),
    'elk.layered.spacing.edgeNodeBetweenLayers': Math.max(
      LAYOUT_SPACING.MIN_EDGE_LAYER_SPACING * complexityMultiplier,
      avgNodeWidth * LAYOUT_SPACING.EDGE_WIDTH_FACTOR * complexityMultiplier
    ).toString(),
    'elk.spacing.edgeNode': Math.max(
      LAYOUT_SPACING.MIN_EDGE_NODE_SPACING * complexityMultiplier,
      avgNodeHeight * LAYOUT_SPACING.EDGE_HEIGHT_FACTOR * complexityMultiplier
    ).toString(),
  };

  const graph = {
    id: 'rootGraph',
    layoutOptions: dynamicElkOptions,
    children: nodes.map((n) => ({
      id: n.id,
      width: n.width || 200,
      height: n.height || 80,
    })),
    edges: edges.map((e) => ({
      id: e.id,
      sources: [e.source],
      targets: [e.target],
    })),
  };
  
  const layout = await elk.layout(graph);
  
  return nodes.map((node) => {
    const layoutNode = layout.children?.find((c) => c.id === node.id);
    return {
      ...node,
      position: { x: layoutNode?.x || 0, y: layoutNode?.y || 0 },
    };
  });
}