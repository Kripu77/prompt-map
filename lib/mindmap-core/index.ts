// Main exports
export { Mindmap, type MindmapProps } from './components/Mindmap';
export { CustomNode, type CustomNodeProps } from './components/CustomNode';

// Types
export type {
  HierarchicalNode,
  D3Node,
  BranchColor,
  BranchColors,
  MindmapConfig,
  LayoutResult
} from './types';

// Layout functions
export { createD3TreeLayout, type D3TreeLayoutOptions } from './layouts';

// Constants and defaults
export {
  DEFAULT_CONFIG,
  DEFAULT_BRANCH_COLORS,
  DEFAULT_HIERARCHICAL_DATA
} from './constants';

// Node types for ReactFlow
export { nodeTypes } from './components';

// Default export
export { Mindmap as default } from './components/Mindmap';