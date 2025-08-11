import ELK from 'elkjs/lib/elk.bundled.js';
import { Node, Edge } from '@xyflow/react';
import { ELK_OPTIONS, LAYOUT_SPACING } from '../../components/features/mindmap/constants';

const elk = new ELK();

export async function layoutGraph(nodes: Node[], edges: Edge[]): Promise<Node[]> {
  if (nodes.length === 0) return nodes;
  
  // Calculate dynamic spacing based on node sizes
  const avgNodeWidth = nodes.reduce((sum, node) => sum + (node.width || 200), 0) / nodes.length;
  const avgNodeHeight = nodes.reduce((sum, node) => sum + (node.height || 80), 0) / nodes.length;
  
  const dynamicElkOptions = {
    ...ELK_OPTIONS,
    'elk.spacing.nodeNode': Math.max(
      LAYOUT_SPACING.MIN_NODE_SPACING,
      avgNodeHeight * LAYOUT_SPACING.NODE_HEIGHT_FACTOR
    ).toString(),
    'elk.layered.spacing.nodeNodeBetweenLayers': Math.max(
      LAYOUT_SPACING.MIN_LAYER_SPACING,
      avgNodeWidth * LAYOUT_SPACING.NODE_WIDTH_FACTOR
    ).toString(),
    'elk.layered.spacing.edgeNodeBetweenLayers': Math.max(
      LAYOUT_SPACING.MIN_EDGE_LAYER_SPACING,
      avgNodeWidth * LAYOUT_SPACING.EDGE_WIDTH_FACTOR
    ).toString(),
    'elk.spacing.edgeNode': Math.max(
      LAYOUT_SPACING.MIN_EDGE_NODE_SPACING,
      avgNodeHeight * LAYOUT_SPACING.EDGE_HEIGHT_FACTOR
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