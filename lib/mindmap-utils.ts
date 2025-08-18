import { toPng, toSvg } from 'html-to-image';
import { ReactFlowInstance, Node, Edge, Viewport } from '@xyflow/react';

type ExportBounds = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
};

type ExportOptions = {
  backgroundColor: string;
  width: number;
  height: number;
  style: {
    transform: string;
  };
};

const DEFAULT_NODE_WIDTH = 200;
const DEFAULT_NODE_HEIGHT = 100;
const EXPORT_PADDING = 50;
const DARK_BACKGROUND = '#0f172a';
const LIGHT_BACKGROUND = '#ffffff';

const getViewportElement = (): HTMLElement | null => {
  return document.querySelector('.react-flow__viewport') as HTMLElement;
};

const calculateNodeBounds = (nodes: Node[]): ExportBounds => {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  
  nodes.forEach((node) => {
    const { x, y } = node.position;
    const width = node.width || DEFAULT_NODE_WIDTH;
    const height = node.height || DEFAULT_NODE_HEIGHT;
    
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + width);
    maxY = Math.max(maxY, y + height);
  });
  
  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX + (EXPORT_PADDING * 2),
    height: maxY - minY + (EXPORT_PADDING * 2)
  };
};

const createExportOptions = (bounds: ExportBounds, theme?: string): ExportOptions => ({
  backgroundColor: theme === 'dark' ? DARK_BACKGROUND : LIGHT_BACKGROUND,
  width: bounds.width,
  height: bounds.height,
  style: {
    transform: `translate(${-bounds.minX + EXPORT_PADDING}px, ${-bounds.minY + EXPORT_PADDING}px)`,
  },
});

const downloadFile = (dataUrl: string, filename: string): void => {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
};

const generateFilename = (extension: string): string => {
  const date = new Date().toISOString().split('T')[0];
  return `mindmap-${date}.${extension}`;
};

const validateExportPrerequisites = (
  reactFlowInstance: ReactFlowInstance | null,
  viewport: HTMLElement | null,
  nodes: Node[]
): boolean => {
  if (!reactFlowInstance) {
    console.warn('React Flow instance not available for export');
    return false;
  }
  
  if (!viewport) {
    console.warn('React Flow viewport not found');
    return false;
  }
  
  if (nodes.length === 0) {
    console.warn('No nodes to export');
    return false;
  }
  
  return true;
};

export const exportMindmap = async (
  reactFlowInstance: ReactFlowInstance | null,
  theme?: string
): Promise<void> => {
  const viewport = getViewportElement();
  const nodes = reactFlowInstance?.getNodes() || [];
  
  if (!validateExportPrerequisites(reactFlowInstance, viewport, nodes)) {
    return;
  }
  
  try {
    const bounds = calculateNodeBounds(nodes);
    const options = createExportOptions(bounds, theme);
    const dataUrl = await toPng(viewport!, options);
    
    downloadFile(dataUrl, generateFilename('png'));
  } catch (error) {
    console.error('Failed to export mindmap:', error);
  }
};

export const exportMindmapAsSvg = async (
  reactFlowInstance: ReactFlowInstance | null,
  theme?: string
): Promise<void> => {
  const viewport = getViewportElement();
  const nodes = reactFlowInstance?.getNodes() || [];
  
  if (!validateExportPrerequisites(reactFlowInstance, viewport, nodes)) {
    return;
  }
  
  try {
    const bounds = calculateNodeBounds(nodes);
    const options = createExportOptions(bounds, theme);
    const dataUrl = await toSvg(viewport!, options);
    
    downloadFile(dataUrl, generateFilename('svg'));
  } catch (error) {
    console.error('Failed to export mindmap as SVG:', error);
  }
};

type MindmapData = {
  nodes: Node[];
  edges: Edge[];
  viewport: Viewport;
  exportedAt: string;
};

const createMindmapData = (reactFlowInstance: ReactFlowInstance): MindmapData => ({
  nodes: reactFlowInstance.getNodes(),
  edges: reactFlowInstance.getEdges(),
  viewport: reactFlowInstance.getViewport(),
  exportedAt: new Date().toISOString(),
});

const downloadJsonFile = (data: MindmapData): void => {
  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  downloadFile(url, generateFilename('json'));
  URL.revokeObjectURL(url);
};

export const exportMindmapAsJson = (
  reactFlowInstance: ReactFlowInstance | null
): void => {
  if (!reactFlowInstance) {
    console.warn('React Flow instance not available for export');
    return;
  }

  try {
    const mindmapData = createMindmapData(reactFlowInstance);
    downloadJsonFile(mindmapData);
  } catch (error) {
    console.error('Failed to export mindmap as JSON:', error);
  }
};

const createDeprecationWarning = (functionName: string, alternative: string) => () => {
  console.warn(`${functionName} function is deprecated. Use ${alternative} instead.`);
};

export const zoomIn = createDeprecationWarning('zoomIn', 'React Flow controls');
export const zoomOut = createDeprecationWarning('zoomOut', 'React Flow controls');
export const toggleFullscreen = createDeprecationWarning('toggleFullscreen', 'React Flow controls');
export const fitContent = createDeprecationWarning('fitContent', 'React Flow fitView');