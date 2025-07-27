

import { INode } from 'markmap-common';


export interface MindmapData {
  content: string;
  title?: string;
  nodes?: INode;
  metadata?: MindmapMetadata;
}

export interface MindmapMetadata {
  nodeCount?: number;
  depth?: number;
  createdAt?: string;
  updatedAt?: string;
  generatedFrom?: string;
  tags?: string[];
}


export interface MindmapState {
  prompt: string;
  isLoading: boolean;
  mindmapData: string;
  mindmapRef: SVGSVGElement | null;
  isUserGenerated?: boolean;
  isFollowUpMode?: boolean;
  error?: string | null;
}

export interface MindmapActions {
  setPrompt: (prompt: string) => void;
  setIsLoading: (isLoading: boolean) => void;
  setMindmapData: (data: string) => void;
  setMindmapRef: (ref: SVGSVGElement) => void;
  setIsUserGenerated?: (isGenerated: boolean) => void;
  setIsFollowUpMode?: (isFollowUp: boolean) => void;
  setError?: (error: string | null) => void;
  reset?: () => void;
}

export type MindmapStore = MindmapState & MindmapActions;


export interface ViewportState {
  scale: number;
  translateX: number;
  translateY: number;
  width: number;
  height: number;
}

export interface ZoomState {
  scale: number;
  minScale: number;
  maxScale: number;
  scaleStep: number;
}

export interface PanState {
  x: number;
  y: number;
  isDragging: boolean;
  startX: number;
  startY: number;
}


export interface TouchGesture {
  scale: number;
  deltaX: number;
  deltaY: number;
  center?: {
    x: number;
    y: number;
  };
}

export interface MindmapControls {
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  fitToView: () => void;
  centerView: () => void;
  toggleFullscreen: () => void;
  exportAsPNG: () => Promise<void>;
}


export interface ToolbarPosition {
  x: number;
  y: number;
  isDragging: boolean;
}

export interface ToolbarState {
  position: ToolbarPosition;
  isVisible: boolean;
  isFullscreen: boolean;
  size: {
    width: number;
    height: number;
  };
}

export interface ToolbarActions {
  setPosition: (position: Partial<ToolbarPosition>) => void;
  setIsVisible: (visible: boolean) => void;
  setIsFullscreen: (fullscreen: boolean) => void;
  setSize: (size: Partial<ToolbarState['size']>) => void;
  resetPosition: () => void;
}


export interface PromptHistoryItem {
  prompt: string;
  timestamp: number;
  isFollowUp: boolean;
  response?: string;
  metadata?: {
    processingTime?: number;
    tokenCount?: number;
    topicShiftDetected?: boolean;
  };
}

export interface PromptHistory {
  items: PromptHistoryItem[];
  currentIndex: number;
  maxItems: number;
}


export interface MarkmapInstance {
  svg: SVGSVGElement;
  markmap: unknown; // Will be typed more specifically when we have markmap types
  transformer: unknown;
}

export interface MarkmapOptions {
  autoFit?: boolean;
  duration?: number;
  maxWidth?: number;
  initialExpandLevel?: number;
  zoom?: boolean;
  pan?: boolean;
}

export interface MarkmapTheme {
  backgroundColor?: string;
  textColor?: string;
  lineColor?: string;
  nodeColors?: string[];
  fontFamily?: string;
  fontSize?: number;
}


export interface ExportOptions {
  format: 'png' | 'svg' | 'pdf' | 'json';
  quality?: number;
  width?: number;
  height?: number;
  backgroundColor?: string;
  includeMetadata?: boolean;
}

export interface ExportResult {
  success: boolean;
  data?: string | Blob;
  filename?: string;
  error?: string;
}


export interface MobileGestures {
  pinchToZoom: boolean;
  dragToPan: boolean;
  doubleTapToZoom: boolean;
  sensitivity: {
    zoom: number;
    pan: number;
  };
}

export interface DeviceCapabilities {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  hasTouch: boolean;
  supportsHover: boolean;
  screenSize: {
    width: number;
    height: number;
  };
}


export type MindmapEventType = 
  | 'zoom'
  | 'pan'
  | 'reset'
  | 'fullscreen'
  | 'export'
  | 'load'
  | 'error';

export interface MindmapEvent {
  type: MindmapEventType;
  timestamp: number;
  data?: unknown;
}

export type MindmapStatus = 
  | 'idle'
  | 'loading'
  | 'generating'
  | 'ready'
  | 'error'
  | 'exporting';


export function isValidMindmapData(data: unknown): data is MindmapData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'content' in data &&
    typeof (data as MindmapData).content === 'string'
  );
}

export function isPromptHistoryItem(item: unknown): item is PromptHistoryItem {
  return (
    typeof item === 'object' &&
    item !== null &&
    'prompt' in item &&
    'timestamp' in item &&
    'isFollowUp' in item &&
    typeof (item as PromptHistoryItem).prompt === 'string' &&
    typeof (item as PromptHistoryItem).timestamp === 'number' &&
    typeof (item as PromptHistoryItem).isFollowUp === 'boolean'
  );
}

export function isTouchGesture(gesture: unknown): gesture is TouchGesture {
  return (
    typeof gesture === 'object' &&
    gesture !== null &&
    'scale' in gesture &&
    'deltaX' in gesture &&
    'deltaY' in gesture &&
    typeof (gesture as TouchGesture).scale === 'number'
  );
}