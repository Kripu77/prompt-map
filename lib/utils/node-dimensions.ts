import { NODE_DIMENSIONS } from '../../components/features/mindmap/constants';
import { NodeDimensions } from '../../components/features/mindmap/types';

type NodeType = 'root' | 'branch' | 'leaf';

type LineStyleMultiplier = {
  h1: number;
  h2: number;
  h3: number;
  bold: number;
  code: number;
  default: number;
};

type BaseLineHeights = Record<NodeType, number>;

type HeightMultipliers = {
  h1: number;
  h2: number;
  h3: number;
  codeBlock: number;
};

const LINE_STYLE_MULTIPLIERS: LineStyleMultiplier = {
  h1: 1.5,
  h2: 1.4,
  h3: 1.3,
  bold: 1.2,
  code: 1.25,
  default: 1,
};

const BASE_LINE_HEIGHTS: BaseLineHeights = {
  root: 28,
  branch: 20,
  leaf: 16,
};

const HEIGHT_MULTIPLIERS: HeightMultipliers = {
  h1: 1.5,
  h2: 1.4,
  h3: 1.3,
  codeBlock: 1.2,
};

const getLineStyleMultiplier = (line: string): number => {
  if (line.startsWith('# ')) return LINE_STYLE_MULTIPLIERS.h1;
  if (line.startsWith('## ')) return LINE_STYLE_MULTIPLIERS.h2;
  if (line.startsWith('### ')) return LINE_STYLE_MULTIPLIERS.h3;
  if (line.startsWith('**') && line.endsWith('**')) return LINE_STYLE_MULTIPLIERS.bold;
  if (line.includes('`')) return LINE_STYLE_MULTIPLIERS.code;
  return LINE_STYLE_MULTIPLIERS.default;
};

const getLineLength = (line: string): number => {
  if (line.startsWith('# ')) return line.length - 2;
  if (line.startsWith('## ')) return line.length - 3;
  if (line.startsWith('### ')) return line.length - 4;
  if (line.startsWith('**') && line.endsWith('**')) return line.length - 4;
  return line.length;
};

const calculateLineWidth = (line: string, baseMultiplier: number): number => {
  const trimmedLine = line.trim();
  const styleMultiplier = getLineStyleMultiplier(trimmedLine);
  const lineLength = getLineLength(trimmedLine);
  return lineLength * baseMultiplier * styleMultiplier;
};

const estimateTextWidth = (text: string, nodeType: NodeType): number => {
  const config = NODE_DIMENSIONS[nodeType.toUpperCase() as keyof typeof NODE_DIMENSIONS];
  const lines = text.split('\n').filter(line => line.trim() !== '');
  
  if (lines.length === 0) {
    return config.MIN_WIDTH * 0.8;
  }
  
  const maxLineWidth = Math.max(
    ...lines.map(line => calculateLineWidth(line, config.WIDTH_MULTIPLIER))
  );
  
  return Math.max(maxLineWidth, config.MIN_WIDTH * 0.6);
};

const getLineHeightMultiplier = (line: string): number => {
  switch (true) {
    case line.startsWith('# '):
      return HEIGHT_MULTIPLIERS.h1;
    case line.startsWith('## '):
      return HEIGHT_MULTIPLIERS.h2;
    case line.startsWith('### '):
      return HEIGHT_MULTIPLIERS.h3;
    case line.includes('```'):
      return HEIGHT_MULTIPLIERS.codeBlock;
    default:
      return 1;
  }
};

const estimateTextHeight = (text: string, nodeType: NodeType): number => {
  const lines = text.split('\n').filter(line => line.trim() !== '');
  const baseHeight = BASE_LINE_HEIGHTS[nodeType];
  
  const totalHeight = lines.reduce((height, line) => {
    const multiplier = getLineHeightMultiplier(line);
    return height + (baseHeight * multiplier);
  }, 0);
  
  return Math.max(totalHeight, baseHeight);
};

const clampDimension = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

export const calculateNodeDimensions = (
  content: string,
  nodeType: NodeType
): NodeDimensions => {
  const config = NODE_DIMENSIONS[nodeType.toUpperCase() as keyof typeof NODE_DIMENSIONS];
  
  const estimatedWidth = estimateTextWidth(content, nodeType);
  const width = clampDimension(
    estimatedWidth + config.PADDING,
    config.MIN_WIDTH,
    config.MAX_WIDTH
  );
  
  const estimatedHeight = estimateTextHeight(content, nodeType);
  const height = clampDimension(
    estimatedHeight + config.LINE_PADDING,
    config.MIN_HEIGHT,
    config.MAX_HEIGHT
  );
  
  return { width, height };
};

export const getNodeType = (level: number, hasChildren: boolean): NodeType => {
  if (level === 1) return 'root';
  if (hasChildren) return 'branch';
  return 'leaf';
};