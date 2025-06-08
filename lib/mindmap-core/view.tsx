/**
 * Legacy view.tsx - Simple example using the modular mindmap-core library
 * 
 * This file demonstrates how to use the new modular structure.
 * For production use, import from the main library index.
 */

import React from 'react';
import { Mindmap } from './index';

/**
 * Simple example component using the modular Mindmap
 */
export default function MindmapView() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Mindmap />
    </div>
  );
}

// Re-export the main component for backward compatibility
export { Mindmap } from './index';