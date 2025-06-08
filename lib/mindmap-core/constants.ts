import { BranchColors, MindmapConfig } from './types';
import { parseMarkdownToHierarchy, generateBranchColors } from './utils/markdown-parser';
import { initialMindMapValue } from '../../app/data/initial';

// Default configuration
export const DEFAULT_CONFIG: MindmapConfig = {
  minDistance: 150,
  centerX: 500,
  centerY: 400,
  treeSize: [800, 600],
};

// Parse markdown data into hierarchical structure
export const DEFAULT_HIERARCHICAL_DATA = parseMarkdownToHierarchy(initialMindMapValue);

// Generate dynamic branch colors based on the parsed data
export const DEFAULT_BRANCH_COLORS: BranchColors = generateBranchColors(DEFAULT_HIERARCHICAL_DATA);

// Fallback color scheme for different branches
export const FALLBACK_BRANCH_COLORS: BranchColors = {
  'default-1': {
    primary: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    light: '#3b82f6aa'
  },
  'default-2': {
    primary: '#ef4444',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    light: '#ef4444aa'
  },
  'default-3': {
    primary: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    light: '#10b981aa'
  },
  'default-4': {
    primary: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    light: '#f59e0baa'
  }
};