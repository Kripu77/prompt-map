// types.ts
import { Node, Edge } from '@xyflow/react';

export interface HierarchicalNode {
  id: string;
  label: string;
  children?: HierarchicalNode[];
}

export interface D3Node {
  name: string;
  id?: string;
  children?: D3Node[];
}

export interface BranchColor {
  primary: string;
  gradient: string;
  light: string;
}

export type BranchColors = {
  [key: string]: BranchColor;
};

export interface MindmapConfig {
  minDistance?: number;
  centerX?: number;
  centerY?: number;
  treeSize?: [number, number];
}

export interface LayoutResult {
  nodes: Node[];
  edges: Edge[];
}