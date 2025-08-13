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
    className="relative bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 text-foreground rounded-2xl shadow-2xl border-2 border-blue-200 dark:border-blue-700/50 hover:shadow-3xl hover:border-blue-300 dark:hover:border-blue-600/70 transition-all duration-300 backdrop-blur-sm ring-1 ring-blue-100 dark:ring-blue-800/30"
    contentClassName="font-bold text-xl leading-relaxed text-blue-900 dark:text-blue-100 tracking-wide"
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
        return {
          className: "relative bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/20 rounded-xl shadow-lg border border-emerald-200 dark:border-emerald-700/50 hover:border-emerald-300 dark:hover:border-emerald-600/70 transition-all duration-300 backdrop-blur-sm ring-1 ring-emerald-100 dark:ring-emerald-800/30",
          contentClassName: "font-semibold text-base leading-relaxed text-emerald-900 dark:text-emerald-100 tracking-normal"
        };
      case 2:
        return {
          className: "relative bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 rounded-xl shadow-lg border border-amber-200 dark:border-amber-700/50 hover:border-amber-300 dark:hover:border-amber-600/70 transition-all duration-300 backdrop-blur-sm ring-1 ring-amber-100 dark:ring-amber-800/30",
          contentClassName: "font-semibold text-base leading-relaxed text-amber-900 dark:text-amber-100 tracking-normal"
        };
      case 3:
        return {
          className: "relative bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/20 rounded-xl shadow-lg border border-red-200 dark:border-red-700/50 hover:border-red-300 dark:hover:border-red-600/70 transition-all duration-300 backdrop-blur-sm ring-1 ring-red-100 dark:ring-red-800/30",
          contentClassName: "font-semibold text-base leading-relaxed text-red-900 dark:text-red-100 tracking-normal"
        };
      default:
        return {
          className: "relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/30 dark:to-gray-800/20 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600/70 transition-all duration-300 backdrop-blur-sm ring-1 ring-gray-100 dark:ring-gray-800/30",
          contentClassName: "font-semibold text-base leading-relaxed text-gray-900 dark:text-gray-100 tracking-normal"
        };
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
    className="relative bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/40 dark:to-slate-700/30 rounded-lg shadow-md border border-slate-200 dark:border-slate-600/50 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-500/70 transition-all duration-300 backdrop-blur-sm ring-1 ring-slate-100 dark:ring-slate-700/30"
    contentClassName="font-medium text-sm leading-relaxed text-slate-700 dark:text-slate-300 tracking-normal"
    showTargetHandle={true}
    showSourceHandle={false}
  />
);

export const nodeTypes = { 
  root: RootNode, 
  branch: BranchNode, 
  leaf: LeafNode 
};