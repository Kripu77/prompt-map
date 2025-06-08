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
    offsetX = 100,
    offsetY = 200
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
  const treeLayout = createTree<D3Node>().size(treeSize);
  const treeData = treeLayout(root);
  
  // Process D3 nodes and convert to ReactFlow format
  treeData.descendants().forEach((d: HierarchyPointNode<D3Node>) => {
    const isRoot = d.depth === 0;
    const isBranch = d.depth === 1;
    const isLeaf = d.depth === 2;
    
    let nodeStyle: CSSProperties;
    let branchColor: BranchColor | undefined;
    
    if (isRoot) {
      nodeStyle = {
        background: 'radial-gradient(circle, #667eea 0%, #764ba2 70%)',
        color: 'white',
        border: '4px solid #fff',
        borderRadius: '50%',
        fontSize: '18px',
        fontWeight: 'bold',
        width: 200,
        height: 80,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 12px 30px rgba(102, 126, 234, 0.4)',
        textAlign: 'center',
        lineHeight: '1.3'
      };
    } else if (isBranch) {
      branchColor = branchColors[d.data.id as keyof typeof branchColors] || branchColors['memcache'];
      nodeStyle = {
        background: branchColor.gradient,
        color: 'white',
        border: `3px solid ${branchColor.primary}`,
        borderRadius: '25px',
        fontSize: '16px',
        fontWeight: 'bold',
        width: 160,
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: `0 8px 25px ${branchColor.primary}40`,
        textAlign: 'center',
        lineHeight: '1.2'
      };
    } else {
      // Get parent branch color
      const parentBranchId = d.parent?.data.id || 'memcache';
      branchColor = branchColors[parentBranchId as keyof typeof branchColors] || branchColors['memcache'];
      nodeStyle = {
        background: `linear-gradient(135deg, ${branchColor.light} 0%, ${branchColor.primary}dd 100%)`,
        color: 'white',
        border: '2px solid #fff',
        borderRadius: '20px',
        fontSize: '13px',
        fontWeight: '500',
        width: 140,
        height: 45,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: `0 4px 15px ${branchColor.primary}30`,
        textAlign: 'center',
        lineHeight: '1.2'
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
        x: (d.y || 0) + offsetX, // Horizontal layout (swap x and y)
        y: (d.x || 0) + offsetY  // Add offset for better positioning
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