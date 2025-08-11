import { LayoutOptions, AnimationConfig } from './types';

export const ELK_OPTIONS: LayoutOptions = {
  'elk.algorithm': 'layered',
  'elk.direction': 'RIGHT',
  'elk.spacing.nodeNode': '80',
  'elk.layered.spacing.nodeNodeBetweenLayers': '120',
  'elk.layered.spacing.edgeNodeBetweenLayers': '60',
  'elk.spacing.edgeNode': '40',
  'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
  'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
  'elk.layered.cycleBreaking.strategy': 'GREEDY',
};

export const NODE_DIMENSIONS = {
  ROOT: {
    MIN_WIDTH: 400, // Increased to accommodate text-2xl content
    MAX_WIDTH: 750, // Increased for larger text
    MIN_HEIGHT: 160, // Increased for taller text
    WIDTH_MULTIPLIER: 15, // Increased for wider text
    HEIGHT_MULTIPLIER: 40, // Increased for taller text lines
    PADDING: 60, // Increased padding for better spacing
    LINE_PADDING: 60, // Increased line spacing
  },
  BRANCH: {
    MIN_WIDTH: 320, // Increased to accommodate text-xl content
    MAX_WIDTH: 600, // Increased for larger text
    MIN_HEIGHT: 140, // Increased for taller text
    WIDTH_MULTIPLIER: 13, // Increased for wider text
    HEIGHT_MULTIPLIER: 35, // Increased for taller text lines
    PADDING: 80, // Increased padding
    LINE_PADDING: 50, // Increased line spacing
  },
  LEAF: {
    MIN_WIDTH: 300, // Increased to accommodate text-xl content
    MAX_WIDTH: 520, // Increased for larger text
    MIN_HEIGHT: 120, // Increased for taller text
    WIDTH_MULTIPLIER: 11, // Increased for wider text
    HEIGHT_MULTIPLIER: 32, // Increased for taller text lines
    PADDING: 70, // Increased padding
    LINE_PADDING: 45, // Increased line spacing
  },
} as const;

export const ANIMATION_CONFIGS: Record<string, AnimationConfig> = {
  ROOT: {
    duration: 0.8,
    ease: "easeOut",
    type: "spring",
    stiffness: 80,
    damping: 20,
  },
  BRANCH: {
    duration: 0.7,
    ease: "easeOut",
    type: "spring",
    stiffness: 60,
    damping: 18,
  },
  LEAF: {
    duration: 0.6,
    ease: "easeOut",
    type: "spring",
    stiffness: 50,
    damping: 16,
  },
} as const;

export const ANIMATION_DELAYS = {
  QUEUE_PROCESSING: 200,
} as const;

export const EDGE_STYLES = {
  DEFAULT: {
    stroke: '#666666',
    strokeWidth: 2,
    strokeDasharray: '8,4',
  },
  DYNAMIC_WIDTH_FACTOR: 0.3,
  MIN_WIDTH: 1,
} as const;

export const LAYOUT_SPACING = {
  NODE_HEIGHT_FACTOR: 0.8,
  NODE_WIDTH_FACTOR: 0.6,
  EDGE_WIDTH_FACTOR: 0.3,
  EDGE_HEIGHT_FACTOR: 0.4,
  MIN_NODE_SPACING: 60,
  MIN_LAYER_SPACING: 100,
  MIN_EDGE_LAYER_SPACING: 40,
  MIN_EDGE_NODE_SPACING: 30,
} as const;

export const REACT_FLOW_OPTIONS = {
  FIT_VIEW_PADDING: 0.15, // Much reduced padding for closer initial view
  MAX_ZOOM: 2.0, // Significantly increased max zoom for better default view
  MIN_ZOOM: 0.1,
  MAX_ZOOM_LIMIT: 3,
  BACKGROUND_GAP: 20,
  BACKGROUND_SIZE: 1,
  BACKGROUND_COLOR: '#e5e5e5',
} as const;