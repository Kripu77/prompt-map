import React from 'react';
import { BaseNode } from './BaseNode';
import { NodeData } from '@/components/features/mindmap/types';
import { ANIMATION_CONFIGS } from '@/components/features/mindmap/constants';

interface NodeProps {
  data: NodeData;
  id: string;
}

export const RootNode = ({ data, id }: NodeProps) => (
  <BaseNode
    data={data}
    id={id}
    nodeType="root"
    className="relative bg-card text-card-foreground rounded-xl shadow-lg border-2 border-border hover:shadow-xl transition-shadow"
    contentClassName="font-bold text-lg leading-tight text-card-foreground"
    showTargetHandle={false}
    showSourceHandle={true}
  />
);

export const BranchNode = ({ data, id }: NodeProps) => (
  <BaseNode
    data={data}
    id={id}
    nodeType="branch"
    animationConfig={ANIMATION_CONFIGS.BRANCH}
    className="relative bg-secondary text-secondary-foreground rounded-lg shadow-md border border-border hover:shadow-lg transition-shadow"
    contentClassName="font-medium text-sm leading-tight text-secondary-foreground"
    showTargetHandle={true}
    showSourceHandle={true}
  />
);

export const LeafNode = ({ data, id }: NodeProps) => (
  <BaseNode
    data={data}
    id={id}
    nodeType="leaf"
    animationConfig={ANIMATION_CONFIGS.LEAF}
    className="relative bg-muted text-muted-foreground rounded-md shadow-sm border border-border hover:shadow-md transition-shadow"
    contentClassName="text-xs leading-tight text-muted-foreground"
    showTargetHandle={true}
    showSourceHandle={false}
  />
);

export const nodeTypes = { 
  root: RootNode, 
  branch: BranchNode, 
  leaf: LeafNode 
};