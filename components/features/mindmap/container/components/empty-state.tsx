"use client";

import { motion } from 'framer-motion';
import { ReactFlowMindmapView } from '@/components/features/mindmap/views';
import { initialMindMapValue } from '@/app/data/initial';

export function EmptyState() {
  return (
    <motion.div 
      className="h-full relative"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      {/* Initial Mindmap Display */}
      <motion.div
        className="h-full"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <ReactFlowMindmapView
          mindmapData={initialMindMapValue}
        />
      </motion.div>
    </motion.div>
  );
}