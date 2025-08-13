import { toPng, toSvg } from 'html-to-image';
import { ReactFlowInstance, Node } from '@xyflow/react';

/**
 * Export mindmap as PNG image
 */
export async function exportMindmap(
  reactFlowInstance: ReactFlowInstance | null,
  theme?: string
): Promise<void> {
  if (!reactFlowInstance) {
    console.warn('React Flow instance not available for export');
    return;
  }

  try {
    // Get the React Flow viewport element
    const viewport = document.querySelector('.react-flow__viewport') as HTMLElement;
    if (!viewport) {
      console.warn('React Flow viewport not found');
      return;
    }

    // Get the bounds of all nodes to determine the export area
    const nodes = reactFlowInstance.getNodes();
    if (nodes.length === 0) {
      console.warn('No nodes to export');
      return;
    }

    // Calculate bounds
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    nodes.forEach((node: Node) => {
      const x = node.position.x;
      const y = node.position.y;
      const width = node.width || 200;
      const height = node.height || 100;
      
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + width);
      maxY = Math.max(maxY, y + height);
    });

    // Add padding
    const padding = 50;
    const exportWidth = maxX - minX + (padding * 2);
    const exportHeight = maxY - minY + (padding * 2);

    // Export as PNG
    const dataUrl = await toPng(viewport, {
      backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
      width: exportWidth,
      height: exportHeight,
      style: {
        transform: `translate(${-minX + padding}px, ${-minY + padding}px)`,
      },
    });

    // Create download link
    const link = document.createElement('a');
    link.download = `mindmap-${new Date().toISOString().split('T')[0]}.png`;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error('Failed to export mindmap:', error);
  }
}

/**
 * Export mindmap as SVG
 */
export async function exportMindmapAsSvg(
  reactFlowInstance: ReactFlowInstance | null,
  theme?: string
): Promise<void> {
  if (!reactFlowInstance) {
    console.warn('React Flow instance not available for export');
    return;
  }

  try {
    const viewport = document.querySelector('.react-flow__viewport') as HTMLElement;
    if (!viewport) {
      console.warn('React Flow viewport not found');
      return;
    }

    const nodes = reactFlowInstance.getNodes();
    if (nodes.length === 0) {
      console.warn('No nodes to export');
      return;
    }

    // Calculate bounds
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    nodes.forEach((node: Node) => {
      const x = node.position.x;
      const y = node.position.y;
      const width = node.width || 200;
      const height = node.height || 100;
      
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + width);
      maxY = Math.max(maxY, y + height);
    });

    const padding = 50;
    const exportWidth = maxX - minX + (padding * 2);
    const exportHeight = maxY - minY + (padding * 2);

    // Export as SVG
    const dataUrl = await toSvg(viewport, {
      backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
      width: exportWidth,
      height: exportHeight,
      style: {
        transform: `translate(${-minX + padding}px, ${-minY + padding}px)`,
      },
    });

    // Create download link
    const link = document.createElement('a');
    link.download = `mindmap-${new Date().toISOString().split('T')[0]}.svg`;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error('Failed to export mindmap as SVG:', error);
  }
}

/**
 * Export mindmap data as JSON
 */
export function exportMindmapAsJson(
  reactFlowInstance: ReactFlowInstance | null
): void {
  if (!reactFlowInstance) {
    console.warn('React Flow instance not available for export');
    return;
  }

  try {
    const nodes = reactFlowInstance.getNodes();
    const edges = reactFlowInstance.getEdges();
    
    const mindmapData = {
      nodes,
      edges,
      viewport: reactFlowInstance.getViewport(),
      exportedAt: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(mindmapData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.download = `mindmap-data-${new Date().toISOString().split('T')[0]}.json`;
    link.href = url;
    link.click();
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export mindmap as JSON:', error);
  }
}

// Legacy function stubs for backward compatibility
export function zoomIn() {
  console.warn('zoomIn function is deprecated. Use React Flow controls instead.');
}

export function zoomOut() {
  console.warn('zoomOut function is deprecated. Use React Flow controls instead.');
}

export function toggleFullscreen() {
  console.warn('toggleFullscreen function is deprecated. Use React Flow controls instead.');
}

export function fitContent() {
  console.warn('fitContent function is deprecated. Use React Flow fitView instead.');
}