import { CSSProperties } from 'react';
import { Node, Edge, Position } from '@xyflow/react';
import { hierarchy, tree as createTree, HierarchyNode, HierarchyPointNode } from 'd3-hierarchy';
import { HierarchicalNode, D3Node, BranchColors, LayoutResult, BranchColor } from '../types';
import { DEFAULT_BRANCH_COLORS, DEFAULT_CONFIG } from '../constants';

export interface D3TreeLayoutOptions {
  data: HierarchicalNode;
  branchColors?: BranchColors;
  treeSize?: [number, number];
  offsetX?: number;
  offsetY?: number;
}

/**
 * Creates a D3 tree layout for the mindmap
 */
export function createD3TreeLayout(options: D3TreeLayoutOptions): LayoutResult {
  const {
    data,
    branchColors = DEFAULT_BRANCH_COLORS,
    treeSize = DEFAULT_CONFIG.treeSize!,
    offsetX = 50,
    offsetY = 100
  } = options;

  const nodes: Node[] = [];
  const edges: Edge[] = [];
  
  // Convert hierarchical data to D3 format
  const d3Data: D3Node = {
    name: data.label,
    children: data.children?.map(branch => ({
      name: branch.label,
      id: branch.id,
      children: branch.children?.map(leaf => ({
        name: leaf.label,
        id: leaf.id
      }))
    }))
  };
  
  // Create D3 hierarchy and tree layout
  const root = hierarchy(d3Data) as HierarchyNode<D3Node>;
  
  // Calculate dynamic node dimensions for separation
  const getNodeDimensions = (node: HierarchyNode<D3Node>) => {
    const textLength = node.data.name.length;
    const lines = Math.ceil(textLength / 25);
    const baseHeight = node.depth === 0 ? 100 : node.depth === 1 ? 80 : 60;
    const height = Math.max(baseHeight, lines * 20 + 30);
    const width = node.depth === 0 ? 250 : node.depth === 1 ? 200 : 160;
    return { width, height };
  };
  
  // Advanced collision detection and positioning
  const checkCollision = (rect1: {x: number, y: number, width: number, height: number}, 
                         rect2: {x: number, y: number, width: number, height: number}, 
                         padding: number = 20) => {
    return !(rect1.x + rect1.width + padding < rect2.x || 
             rect2.x + rect2.width + padding < rect1.x || 
             rect1.y + rect1.height + padding < rect2.y || 
             rect2.y + rect2.height + padding < rect1.y);
  };
  
  const treeLayout = createTree<D3Node>()
    .size(treeSize)
    .separation((a, b) => {
      const aDims = getNodeDimensions(a);
      const bDims = getNodeDimensions(b);
      
      // Dynamic separation based on actual node dimensions
      const totalHeight = aDims.height + bDims.height;
      const baseSeparation = totalHeight / 60; // More aggressive base separation
      
      if (a.parent === b.parent) {
        // Sibling nodes - ensure no overlap with padding
        return Math.max(2.0, baseSeparation * 1.5);
      } else {
        // Different branches - larger separation
        return Math.max(2.5, baseSeparation * 2.0);
      }
    });
  const treeData = treeLayout(root);
  
  // Store node positions for collision detection
  const nodePositions: Array<{x: number, y: number, width: number, height: number, node: HierarchyPointNode<D3Node>}> = [];
  
  // First pass: calculate initial positions and dimensions
  treeData.descendants().forEach((d: HierarchyPointNode<D3Node>) => {
    const nodeDims = getNodeDimensions(d);
    const initialX = (d.y || 0) + offsetX;
    const initialY = (d.x || 0) + offsetY;
    
    nodePositions.push({
      x: initialX,
      y: initialY,
      width: nodeDims.width,
      height: nodeDims.height,
      node: d
    });
  });
  
  // Second pass: resolve collisions by adjusting positions
  for (let i = 0; i < nodePositions.length; i++) {
    const currentNode = nodePositions[i];
    let adjusted = true;
    let attempts = 0;
    
    while (adjusted && attempts < 10) {
      adjusted = false;
      attempts++;
      
      for (let j = 0; j < nodePositions.length; j++) {
        if (i === j) continue;
        
        const otherNode = nodePositions[j];
        if (checkCollision(currentNode, otherNode, 25)) {
          // Adjust position based on depth and relationship
          if (currentNode.node.depth > otherNode.node.depth) {
            // Move child nodes down
            currentNode.y = otherNode.y + otherNode.height + 30;
          } else if (currentNode.node.depth === otherNode.node.depth) {
            // Move sibling nodes apart vertically
            if (currentNode.y <= otherNode.y) {
              currentNode.y = otherNode.y - currentNode.height - 30;
            } else {
              currentNode.y = otherNode.y + otherNode.height + 30;
            }
          }
          adjusted = true;
        }
      }
    }
  }
  
  // Process D3 nodes and convert to ReactFlow format with adjusted positions
  nodePositions.forEach((nodePos) => {
    const d = nodePos.node;
    const isRoot = d.depth === 0;
    const isBranch = d.depth === 1;
    const isLeaf = d.depth === 2;
    
    let nodeStyle: CSSProperties;
    let branchColor: BranchColor | undefined;
    
    // Calculate dynamic height based on text length for better readability
    const textLength = d.data.name.length;
    const getNodeHeight = (baseHeight: number, text: string) => {
      const lines = Math.ceil(text.length / 25); // Increased chars per line for better fit
      return Math.max(baseHeight, lines * 20 + 30); // Reduced line height with consistent padding
    };
    
    if (isRoot) {
      nodeStyle = {
        background: 'radial-gradient(circle, #667eea 0%, #764ba2 70%)',
        color: 'white',
        border: '4px solid #fff',
        borderRadius: '25px',
        fontSize: '16px',
        fontWeight: 'bold',
        width: 250,
        height: getNodeHeight(100, d.data.name),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 12px 30px rgba(102, 126, 234, 0.4)',
        textAlign: 'center',
        lineHeight: '1.4',
        padding: '10px'
      };
    } else if (isBranch) {
      branchColor = branchColors[d.data.id as keyof typeof branchColors] || branchColors['memcache'];
      nodeStyle = {
        background: branchColor.gradient,
        color: 'white',
        border: `3px solid ${branchColor.primary}`,
        borderRadius: '20px',
        fontSize: '14px',
        fontWeight: 'bold',
        width: 200,
        height: getNodeHeight(80, d.data.name),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: `0 8px 25px ${branchColor.primary}40`,
        textAlign: 'center',
        lineHeight: '1.3',
        padding: '8px'
      };
    } else {
      // Get parent branch color
      const parentBranchId = d.parent?.data.id || 'memcache';
      branchColor = branchColors[parentBranchId as keyof typeof branchColors] || branchColors['memcache'];
      nodeStyle = {
        background: `linear-gradient(135deg, ${branchColor.light} 0%, ${branchColor.primary}dd 100%)`,
        color: 'white',
        border: '2px solid #fff',
        borderRadius: '15px',
        fontSize: '12px',
        fontWeight: '500',
        width: 160,
        height: getNodeHeight(60, d.data.name),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: `0 4px 15px ${branchColor.primary}30`,
        textAlign: 'center',
        lineHeight: '1.3',
        padding: '6px'
      };
    }
    
    const nodeId = isRoot ? 'root' : (d.data.id || `node-${d.x || 0}-${d.y || 0}`);
    const hasParent = d.parent !== null;
    const hasChildren = d.children && d.children.length > 0;
    
    nodes.push({
      id: nodeId,
      type: 'custom',
      data: { 
        label: d.data.name,
        hasParent,
        hasChildren
      },
      position: { 
        x: nodePos.x, // Use collision-adjusted position
        y: nodePos.y  // Use collision-adjusted position
      },
      style: nodeStyle,
      sourcePosition: Position.Right,
      targetPosition: Position.Left
    });
    
    // Create edges
    if (d.parent) {
      const parentId = d.parent.depth === 0 ? 'root' : (d.parent.data.id || 'unknown');
      const edgeColor = isBranch ? branchColor?.primary || '#3b82f6' : 
                       branchColors[(d.parent.data.id || 'memcache') as keyof typeof branchColors]?.primary || '#3b82f6';
      
      edges.push({
        id: `edge-${parentId}-${nodeId}`,
        source: parentId,
        target: nodeId,
        sourceHandle: 'right',
        targetHandle: 'left',
        type: 'smoothstep',
        style: {
          stroke: edgeColor,
          strokeWidth: isBranch ? 4 : 2,
          opacity: 0.8
        },
        animated: false
      });
    }
  });
  
  return { nodes, edges };
}