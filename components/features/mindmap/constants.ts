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
    MIN_WIDTH: 600, // Significantly increased minimum width for spacious layout
    MAX_WIDTH: 1200, // Much larger maximum width for extensive content
    WIDTH_MULTIPLIER: 16, // Higher width calculation per character
    MIN_HEIGHT: 240, // Increased minimum height for better proportions
    MAX_HEIGHT: 800, // Larger maximum height
    HEIGHT_MULTIPLIER: 55, // Higher height calculation per line
    PADDING: 120, // Much more generous internal padding
    LINE_PADDING: 90, // Increased line spacing for better readability
  },
  BRANCH: {
    MIN_WIDTH: 500, // Much wider minimum width for better content display
    MAX_WIDTH: 1000, // Significantly increased maximum width
    WIDTH_MULTIPLIER: 14, // Higher width calculation per character
    MIN_HEIGHT: 220, // Increased minimum height
    MAX_HEIGHT: 700, // Larger maximum height
    HEIGHT_MULTIPLIER: 50, // Higher height calculation per line
    PADDING: 130, // Much more generous internal padding
    LINE_PADDING: 80, // Increased line spacing
  },
  LEAF: {
    MIN_WIDTH: 550, // Much wider minimum width for detailed content
    MAX_WIDTH: 1300, // Very large maximum width for comprehensive information
    WIDTH_MULTIPLIER: 12, // Higher width calculation per character
    MIN_HEIGHT: 420, // Increased minimum height
    MAX_HEIGHT: 750, // Larger maximum height
    HEIGHT_MULTIPLIER: 45, // Higher height calculation per line
    PADDING: 110, // Much more generous internal padding
    LINE_PADDING: 70, // Increased line spacing
  },
} as const;

export const ANIMATION_CONFIGS: Record<string, AnimationConfig> = {
  ROOT: {
    duration: 0.3,
    ease: "easeOut",
    type: "spring",
    stiffness: 80,
    damping: 20,
  },
  BRANCH: {
    duration: 0.3,
    ease: "easeOut",
    type: "spring",
    stiffness: 60,
    damping: 18,
  },
  LEAF: {
    duration: 0.3,
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
    // strokeWidth: ::, // Slightly thicker for better visibility
    // strokeDasharray: '1', // More modern dash pattern
  },
  // Branch-based color scheme - each main branch gets its own color family
  BRANCH_COLOR_FAMILIES: {
    LIGHT: [
      {
        base: '#3b82f6', // Blue family
        variants: ['#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'],
      },
      {
        base: '#10b981', // Emerald family
        variants: ['#34d399', '#6ee7b7', '#9deccc', '#c6f6d5'],
      },
      {
        base: '#f59e0b', // Amber family
        variants: ['#fbbf24', '#fcd34d', '#fde68a', '#fef3c7'],
      },
      {
        base: '#ef4444', // Red family
        variants: ['#f87171', '#fca5a5', '#fecaca', '#fee2e2'],
      },
      {
        base: '#8b5cf6', // Purple family
        variants: ['#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'],
      },
      {
        base: '#06b6d4', // Cyan family
        variants: ['#22d3ee', '#67e8f9', '#a5f3fc', '#cffafe'],
      },
      {
        base: '#ec4899', // Pink family
        variants: ['#f472b6', '#f9a8d4', '#fbcfe8', '#fce7f3'],
      },
      {
        base: '#84cc16', // Lime family
        variants: ['#a3e635', '#bef264', '#d9f99d', '#ecfccb'],
      },
    ],
    DARK: [
      {
        base: '#60a5fa', // Blue family (darker)
        variants: ['#93c5fd', '#bfdbfe', '#dbeafe', '#eff6ff'],
      },
      {
        base: '#34d399', // Emerald family (darker)
        variants: ['#6ee7b7', '#9deccc', '#c6f6d5', '#ecfdf5'],
      },
      {
        base: '#fbbf24', // Amber family (darker)
        variants: ['#fcd34d', '#fde68a', '#fef3c7', '#fffbeb'],
      },
      {
        base: '#f87171', // Red family (darker)
        variants: ['#fca5a5', '#fecaca', '#fee2e2', '#fef2f2'],
      },
      {
        base: '#a78bfa', // Purple family (darker)
        variants: ['#c4b5fd', '#ddd6fe', '#ede9fe', '#f5f3ff'],
      },
      {
        base: '#22d3ee', // Cyan family (darker)
        variants: ['#67e8f9', '#a5f3fc', '#cffafe', '#f0fdfa'],
      },
      {
        base: '#f472b6', // Pink family (darker)
        variants: ['#f9a8d4', '#fbcfe8', '#fce7f3', '#fdf2f8'],
      },
      {
        base: '#a3e635', // Lime family (darker)
        variants: ['#bef264', '#d9f99d', '#ecfccb', '#f7fee7'],
      },
    ],
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
  MIN_WIDTH: 0.1, // Increased minimum width
  MAX_WIDTH: 12, // Maximum width for root level edges
} as const;

export const LAYOUT_SPACING = {
  NODE_HEIGHT_FACTOR: 0.1, // Minimal vertical spacing
  NODE_WIDTH_FACTOR: 0.7, // Minimal horizontal spacing
  EDGE_WIDTH_FACTOR: 0.1, // Minimal edge width factor
  EDGE_HEIGHT_FACTOR: 0.1, // Minimal edge height factor
  MIN_NODE_SPACING: 80, // Minimal spacing between subbranches
  MIN_LAYER_SPACING: 60, // Minimal layer separation
  MIN_EDGE_LAYER_SPACING: 40, // Minimal edge layer spacing
  MIN_EDGE_NODE_SPACING: 20, // Minimal edge node spacing
} as const;

export const REACT_FLOW_OPTIONS = {
  FIT_VIEW_PADDING: 0.6, // Reduced padding for better initial positioning
  MAX_ZOOM: 1.5, 
  MIN_ZOOM: 0.2,
  MAX_ZOOM_LIMIT: 3,
  BACKGROUND_GAP: 16, // Slightly smaller for more refined pattern
  BACKGROUND_SIZE: 0.8, // Smaller dots for subtlety
  // shadcn/ui consistent background colors
  BACKGROUND_COLOR_LIGHT: 'hsl(var(--muted))', // Uses shadcn muted color
  BACKGROUND_COLOR_DARK: 'hsl(var(--muted))', // Uses shadcn muted color for consistency
  
  // Default viewport positioning - moves mindmap slightly below and to the right
  DEFAULT_VIEWPORT: {
    x: 50, // Move 50px to the right
    y: 30, // Move 30px down
    zoom: 1
  },
  
  // FitView configurations
  FIT_VIEW_OPTIONS: {
    DEFAULT: {
      padding: 0.05,
      maxZoom: 1.0,
      includeHiddenNodes: true
    },
    AUTO_ZOOM: {
      padding: 0.5,
      maxZoom: 1.0,
      minZoom: 0.3,
      duration: 600,
      includeHiddenNodes: false
    },
    REFRESH: {
      padding: 0.05,
      maxZoom: 1.0,
      includeHiddenNodes: true
    }
  },
  
  // Default edge options
  DEFAULT_EDGE_OPTIONS: {
    animated: true
  },
  
  // Timing configurations
  TIMING: {
    AUTO_ZOOM_DELAY: 100, // Reduced delay for faster display
    LAYOUT_RENDER_DELAY: 10, // Reduced delay for faster layout rendering
    ZOOM_DURATION: 600
  }
} as const;

// Handle styling configurations
export const HANDLE_STYLES = {
  DEFAULT: {
    transform: 'translateY(-50%)',
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    border: '2px solid white',
    boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
    width: '12px',
    height: '12px'
  },
  POSITIONS: {
    SOURCE_RIGHT: { right: -8, top: '50%' },
    SOURCE_RIGHT_BRANCH: { right: -6, top: '50%' },
    TARGET_LEFT: { left: -6, top: '50%' }
  }
} as const;

// Node styling configurations
export const NODE_STYLES = {
  ROOT: {
    className: "relative bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 text-foreground rounded-2xl shadow-2xl border-2 border-blue-200 dark:border-blue-700/50 hover:shadow-3xl hover:border-blue-300 dark:hover:border-blue-600/70 transition-all duration-300 backdrop-blur-sm ring-1 ring-blue-100 dark:ring-blue-800/30",
    contentClassName: "font-bold text-xl leading-relaxed text-blue-900 dark:text-blue-100 tracking-wide"
  },
  BRANCH: {
    LEVEL_1: {
      className: "relative bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/20 rounded-xl shadow-lg border border-emerald-200 dark:border-emerald-700/50 hover:border-emerald-300 dark:hover:border-emerald-600/70 transition-all duration-300 backdrop-blur-sm ring-1 ring-emerald-100 dark:ring-emerald-800/30",
      contentClassName: "font-semibold text-base leading-relaxed text-emerald-900 dark:text-emerald-100 tracking-normal"
    },
    LEVEL_2: {
      className: "relative bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 rounded-xl shadow-lg border border-amber-200 dark:border-amber-700/50 hover:border-amber-300 dark:hover:border-amber-600/70 transition-all duration-300 backdrop-blur-sm ring-1 ring-amber-100 dark:ring-amber-800/30",
      contentClassName: "font-semibold text-base leading-relaxed text-amber-900 dark:text-amber-100 tracking-normal"
    },
    LEVEL_3: {
      className: "relative bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/20 rounded-xl shadow-lg border border-red-200 dark:border-red-700/50 hover:border-red-300 dark:hover:border-red-600/70 transition-all duration-300 backdrop-blur-sm ring-1 ring-red-100 dark:ring-red-800/30",
      contentClassName: "font-semibold text-base leading-relaxed text-red-900 dark:text-red-100 tracking-normal"
    },
    DEFAULT: {
      className: "relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/30 dark:to-gray-800/20 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600/70 transition-all duration-300 backdrop-blur-sm ring-1 ring-gray-100 dark:ring-gray-800/30",
      contentClassName: "font-semibold text-base leading-relaxed text-gray-900 dark:text-gray-100 tracking-normal"
    }
  },
  LEAF: {
    className: "relative bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/40 dark:to-slate-700/30 rounded-lg shadow-md border border-slate-200 dark:border-slate-600/50 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-500/70 transition-all duration-300 backdrop-blur-sm ring-1 ring-slate-100 dark:ring-slate-700/30",
    contentClassName: "font-medium text-sm leading-relaxed text-slate-700 dark:text-slate-300 tracking-normal"
  }
} as const;

// Motion animation configurations for nodes
export const MOTION_CONFIGS = {
  ROOT: {
    initial: { scale: 0, opacity: 0, x: -50 },
    animate: { scale: 1, opacity: 1, x: 0 }
  },
  BRANCH: {
    initial: { scale: 0, opacity: 0, x: -50 },
    animate: { scale: 1, opacity: 1, x: 0 }
  },
  LEAF: {
    initial: { scale: 0, opacity: 0, x: -30 },
    animate: { scale: 1, opacity: 1, x: 0 }
  }
} as const;