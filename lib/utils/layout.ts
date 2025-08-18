import ELK from 'elkjs/lib/elk.bundled.js';
import { Node, Edge } from '@xyflow/react';
import { ELK_OPTIONS, LAYOUT_SPACING } from '../../components/features/mindmap/constants';

type NodeMetrics = {
  depth: number;
  branching: number;
};

type LayoutMetrics = {
  maxDepth: number;
  maxBranching: number;
  avgWidth: number;
  avgHeight: number;
  complexityMultiplier: number;
};

type ElkNode = {
  id: string;
  width: number;
  height: number;
};

type ElkEdge = {
  id: string;
  sources: string[];
  targets: string[];
};

type ElkLayoutNode = {
  id: string;
  x?: number;
  y?: number;
};

type ElkLayoutResult = {
  children?: ElkLayoutNode[];
};

const elk = new ELK();

const DEFAULT_NODE_WIDTH = 200;
const DEFAULT_NODE_HEIGHT = 80;
const DEPTH_MULTIPLIER_BASE = 1.1;
const BRANCHING_MULTIPLIER_BASE = 1.05;

const extractNodeMetrics = (node: Node): NodeMetrics => {
  const level = typeof node.data?.level === 'number' ? node.data.level : 1;
  const hasChildren = node.data?.hasChildren || false;
  const children = node.data?.children;
  const childrenCount = Array.isArray(children) ? children.length : 0;
  
  return {
    depth: level,
    branching: hasChildren ? childrenCount : 0,
  };
};

const calculateLayoutMetrics = (nodes: Node[]): LayoutMetrics => {
  const metrics = nodes.map(extractNodeMetrics);
  
  const depths = metrics.map(m => m.depth).filter(d => typeof d === 'number');
  const branchings = metrics.map(m => m.branching).filter(b => typeof b === 'number');
  
  const maxDepth = depths.length > 0 ? Math.max(...depths) : 1;
  const maxBranching = branchings.length > 0 ? Math.max(...branchings) : 0;
  
  const avgWidth = nodes.reduce((sum, node) => sum + (node.width || DEFAULT_NODE_WIDTH), 0) / nodes.length;
  const avgHeight = nodes.reduce((sum, node) => sum + (node.height || DEFAULT_NODE_HEIGHT), 0) / nodes.length;
  
  const depthMultiplier = Math.max(1, Math.pow(DEPTH_MULTIPLIER_BASE, maxDepth - 1));
  const branchingMultiplier = Math.max(1, Math.pow(BRANCHING_MULTIPLIER_BASE, maxBranching));
  const complexityMultiplier = depthMultiplier * branchingMultiplier;
  
  return {
    maxDepth,
    maxBranching,
    avgWidth,
    avgHeight,
    complexityMultiplier,
  };
};

const createDynamicSpacing = (metrics: LayoutMetrics) => {
  const { avgWidth, avgHeight, complexityMultiplier } = metrics;
  
  return {
    nodeNode: Math.max(
      LAYOUT_SPACING.MIN_NODE_SPACING * complexityMultiplier,
      avgHeight * LAYOUT_SPACING.NODE_HEIGHT_FACTOR * complexityMultiplier
    ),
    nodeNodeBetweenLayers: Math.max(
      LAYOUT_SPACING.MIN_LAYER_SPACING * complexityMultiplier,
      avgWidth * LAYOUT_SPACING.NODE_WIDTH_FACTOR * complexityMultiplier
    ),
    edgeNodeBetweenLayers: Math.max(
      LAYOUT_SPACING.MIN_EDGE_LAYER_SPACING * complexityMultiplier,
      avgWidth * LAYOUT_SPACING.EDGE_WIDTH_FACTOR * complexityMultiplier
    ),
    edgeNode: Math.max(
      LAYOUT_SPACING.MIN_EDGE_NODE_SPACING * complexityMultiplier,
      avgHeight * LAYOUT_SPACING.EDGE_HEIGHT_FACTOR * complexityMultiplier
    ),
  };
};

const createElkOptions = (spacing: ReturnType<typeof createDynamicSpacing>) => ({
  ...ELK_OPTIONS,
  'elk.spacing.nodeNode': spacing.nodeNode.toString(),
  'elk.layered.spacing.nodeNodeBetweenLayers': spacing.nodeNodeBetweenLayers.toString(),
  'elk.layered.spacing.edgeNodeBetweenLayers': spacing.edgeNodeBetweenLayers.toString(),
  'elk.spacing.edgeNode': spacing.edgeNode.toString(),
});

const createElkNodes = (nodes: Node[]): ElkNode[] => 
  nodes.map(node => ({
    id: node.id,
    width: node.width || DEFAULT_NODE_WIDTH,
    height: node.height || DEFAULT_NODE_HEIGHT,
  }));

const createElkEdges = (edges: Edge[]): ElkEdge[] => 
  edges.map(edge => ({
    id: edge.id,
    sources: [edge.source],
    targets: [edge.target],
  }));

const applyLayoutPositions = (nodes: Node[], layoutResult: ElkLayoutResult): Node[] => 
  nodes.map(node => {
    const layoutNode = layoutResult.children?.find((c: ElkLayoutNode) => c.id === node.id);
    return {
      ...node,
      position: { x: layoutNode?.x || 0, y: layoutNode?.y || 0 },
    };
  });

export const layoutGraph = async (nodes: Node[], edges: Edge[]): Promise<Node[]> => {
  if (nodes.length === 0) return nodes;
  
  const metrics = calculateLayoutMetrics(nodes);
  const spacing = createDynamicSpacing(metrics);
  const elkOptions = createElkOptions(spacing);
  
  const graph = {
    id: 'rootGraph',
    layoutOptions: elkOptions,
    children: createElkNodes(nodes),
    edges: createElkEdges(edges),
  };
  
  const layout = await elk.layout(graph);
  return applyLayoutPositions(nodes, layout);
};