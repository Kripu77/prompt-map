import { LayoutOptions, AnimationConfig } from './types';

export const ELK_OPTIONS: LayoutOptions = {
  'elk.algorithm': 'layered',
  'elk.direction': 'RIGHT',
  'elk.spacing.nodeNode': '30', // Minimal spacing between subbranches
  'elk.layered.spacing.nodeNodeBetweenLayers': '40', // Extremely tight layer spacing
  'elk.layered.spacing.edgeNodeBetweenLayers': '25', // Minimal root-to-children distance
  'elk.spacing.edgeNode': '20', // Minimal edge-to-node spacing
  'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
  'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
  'elk.layered.cycleBreaking.strategy': 'GREEDY',
};

export const NODE_DIMENSIONS = {
  ROOT: {
    MIN_WIDTH: 350, // Minimum width for content
    MAX_WIDTH: 700, // Maximum width to prevent excessive growth
    WIDTH_MULTIPLIER: 12, // Width calculation per character
    MIN_HEIGHT: 180, // Minimum height for content
    MAX_HEIGHT: 600, // Maximum height to prevent excessive growth
    HEIGHT_MULTIPLIER: 45, // Height calculation per line
    PADDING: 70, // Internal padding
    LINE_PADDING: 70, // Line spacing
  },
  BRANCH: {
    MIN_WIDTH: 280, // Minimum width for content
    MAX_WIDTH: 550, // Maximum width to prevent excessive growth
    WIDTH_MULTIPLIER: 10, // Width calculation per character
    MIN_HEIGHT: 160, // Minimum height for content
    MAX_HEIGHT: 500, // Maximum height to prevent excessive growth
    HEIGHT_MULTIPLIER: 40, // Height calculation per line
    PADDING: 90, // Internal padding
    LINE_PADDING: 60, // Line spacing
  },
  LEAF: {
    MIN_WIDTH: 320, // Minimum width for content
    MAX_WIDTH: 800, // Maximum width to prevent excessive growth
    WIDTH_MULTIPLIER: 8, // Width calculation per character
    MIN_HEIGHT: 350, // Minimum height for content
    MAX_HEIGHT: 500, // Maximum height to prevent excessive growth
    HEIGHT_MULTIPLIER: 36, // Height calculation per line
    PADDING: 80, // Internal padding
    LINE_PADDING: 50, // Line spacing
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
    stroke: '#22c55e', // Modern green color
    strokeWidth: 1, // Slightly thicker for better visibility
    strokeDasharray: '4,6', // More modern dash pattern
  },
  // Hierarchical color scheme for different levels
  HIERARCHICAL_COLORS: {
    LIGHT: {
      0: '#3b82f6', // Blue for root level (level 0)
      1: '#10b981', // Emerald for first branches (level 1) 
      2: '#f59e0b', // Amber for second branches (level 2)
      3: '#ef4444', // Red for third level (level 3)
      4: '#8b5cf6', // Purple for fourth level (level 4)
      5: '#06b6d4', // Cyan for fifth level (level 5)
      DEFAULT: '#6b7280', // Gray for deeper levels
    },
    DARK: {
      0: '#60a5fa', // Lighter blue for root level in dark mode
      1: '#34d399', // Lighter emerald for first branches
      2: '#fbbf24', // Lighter amber for second branches
      3: '#f87171', // Lighter red for third level
      4: '#a78bfa', // Lighter purple for fourth level
      5: '#22d3ee', // Lighter cyan for fifth level
      DEFAULT: '#9ca3af', // Lighter gray for deeper levels
    },
  },
  // Enhanced visual effects
  GLOW_EFFECTS: {
    LIGHT: {
      filter: 'drop-shadow(0 0 6px rgba(59, 130, 246, 0.3))',
      opacity: 0.9,
    },
    DARK: {
      filter: 'drop-shadow(0 0 8px rgba(96, 165, 250, 0.4))',
      opacity: 0.95,
    },
  },
  DYNAMIC_WIDTH_FACTOR: 0.8, // Increased for more dramatic width changes
  MIN_WIDTH: 2, // Increased minimum width
  MAX_WIDTH: 12, // Maximum width for root level edges
} as const;

export const LAYOUT_SPACING = {
  NODE_HEIGHT_FACTOR: 0.2, // Minimal vertical spacing
  NODE_WIDTH_FACTOR: 0.2, // Minimal horizontal spacing
  EDGE_WIDTH_FACTOR: 0.2, // Minimal edge width factor
  EDGE_HEIGHT_FACTOR: 0.1, // Minimal edge height factor
  MIN_NODE_SPACING: 30, // Minimal spacing between subbranches
  MIN_LAYER_SPACING: 40, // Minimal layer separation
  MIN_EDGE_LAYER_SPACING: 25, // Minimal edge layer spacing
  MIN_EDGE_NODE_SPACING: 20, // Minimal edge node spacing
} as const;

export const REACT_FLOW_OPTIONS = {
  FIT_VIEW_PADDING: 0.1, // Reduced padding for better initial positioning
  MAX_ZOOM: 1.5, 
  MIN_ZOOM: 0.2,
  MAX_ZOOM_LIMIT: 3,
  BACKGROUND_GAP: 16, // Slightly smaller for more refined pattern
  BACKGROUND_SIZE: 0.8, // Smaller dots for subtlety
  // shadcn/ui consistent background colors
  BACKGROUND_COLOR_LIGHT: 'hsl(var(--muted))', // Uses shadcn muted color
  BACKGROUND_COLOR_DARK: 'hsl(var(--muted))', // Uses shadcn muted color for consistency
} as const;