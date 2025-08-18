import React from 'react';
import { BaseNode } from './BaseNode';
import { NodeData } from '@/components/features/mindmap/types';
import { ANIMATION_CONFIGS, NODE_STYLES } from '@/components/features/mindmap/constants';

interface NodeProps {
  data: NodeData;
  id: string;
}

export const RootNode = ({ data, id }: NodeProps) => (
  <BaseNode
    data={data}
    id={id}
    nodeType="root"
    animationConfig={ANIMATION_CONFIGS.ROOT}
    className={NODE_STYLES.ROOT.className}
    contentClassName={NODE_STYLES.ROOT.contentClassName}
    showTargetHandle={false}
    showSourceHandle={true}
  />
);

export const BranchNode = ({ data, id }: NodeProps) => {
  // Dynamic styling based on level for better hierarchy
  const level = data.level || 1;
  
  const getNodeStyles = () => {
    switch (level) {
      case 1:
        return NODE_STYLES.BRANCH.LEVEL_1;
      case 2:
        return NODE_STYLES.BRANCH.LEVEL_2;
      case 3:
        return NODE_STYLES.BRANCH.LEVEL_3;
      default:
        return NODE_STYLES.BRANCH.DEFAULT;
    }
  };
  
  const styles = getNodeStyles();
  
  return (
    <BaseNode
      data={data}
      id={id}
      nodeType="branch"
      animationConfig={ANIMATION_CONFIGS.BRANCH}
      className={styles.className}
      contentClassName={styles.contentClassName}
      showTargetHandle={true}
      showSourceHandle={true}
    />
  );
};

export const LeafNode = ({ data, id }: NodeProps) => (
  <BaseNode
    data={data}
    id={id}
    nodeType="leaf"
    animationConfig={ANIMATION_CONFIGS.LEAF}
    className={NODE_STYLES.LEAF.className}
    contentClassName={NODE_STYLES.LEAF.contentClassName}
    showTargetHandle={true}
    showSourceHandle={false}
  />
);

export const nodeTypes = { 
  root: RootNode, 
  branch: BranchNode, 
  leaf: LeafNode 
};