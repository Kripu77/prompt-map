import { Node } from '@xyflow/react';

export interface NodeData extends Record<string, unknown> {
  content: string;
  level: number;
  hasChildren: boolean;
  children?: unknown[];
  onToggle?: (id: string) => void;
  expanded?: boolean;
  isNewlyRendered?: boolean;
}

export interface MindmapNode extends Node {
  data: NodeData;
}

export interface NodeDimensions {
  width: number;
  height: number;
}

export interface AnimationConfig {
  duration: number;
  ease: string;
  type: string;
  stiffness: number;
  damping: number;
}

export interface ReactFlowMindmapViewProps {
  mindmapData: string | null;
  className?: string;
}

export interface LayoutOptions {
  'elk.algorithm': string;
  'elk.direction': string;
  'elk.spacing.nodeNode': string;
  'elk.layered.spacing.nodeNodeBetweenLayers': string;
  'elk.layered.spacing.edgeNodeBetweenLayers': string;
  'elk.spacing.edgeNode': string;
  'elk.layered.nodePlacement.strategy': string;
  'elk.layered.crossingMinimization.strategy': string;
  'elk.layered.cycleBreaking.strategy': string;
}