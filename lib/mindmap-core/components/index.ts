export { CustomNode, type CustomNodeProps } from './CustomNode';
export { Mindmap, type MindmapProps } from './Mindmap';

// Node types configuration for ReactFlow
import { CustomNode } from './CustomNode';

export const nodeTypes = {
  custom: CustomNode,
};