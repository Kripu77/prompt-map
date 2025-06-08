import { BranchColors, MindmapConfig } from './types';

// Default configuration
export const DEFAULT_CONFIG: MindmapConfig = {
  minDistance: 150,
  centerX: 500,
  centerY: 400,
  treeSize: [800, 600],
};

// Color scheme for different branches
export const DEFAULT_BRANCH_COLORS: BranchColors = {
  'memcache': {
    primary: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    light: '#3b82f6aa'
  },
  'redis': {
    primary: '#ef4444',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    light: '#ef4444aa'
  },
  'performance': {
    primary: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    light: '#10b981aa'
  },
  'use-cases': {
    primary: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    light: '#f59e0baa'
  }
};

// Default sample data
export const DEFAULT_HIERARCHICAL_DATA = {
  id: 'root',
  label: 'Technology Comparison',
  children: [
    {
      id: 'memcache',
      label: 'Memcache',
      children: [
        { id: 'memcache-simple', label: 'Simple key-value store' },
        { id: 'memcache-fast', label: 'Fast caching' },
        { id: 'memcache-memory', label: 'Memory efficient' }
      ]
    },
    {
      id: 'redis',
      label: 'Redis',
      children: [
        { id: 'redis-structures', label: 'Advanced data structures' },
        { id: 'redis-persistence', label: 'Data persistence' },
        { id: 'redis-pub-sub', label: 'Pub/Sub messaging' }
      ]
    },
    {
      id: 'performance',
      label: 'Performance Comparison',
      children: [
        { id: 'perf-speed', label: 'Access speed' },
        { id: 'perf-memory', label: 'Memory usage' },
        { id: 'perf-scalability', label: 'Scalability' }
      ]
    },
    {
      id: 'use-cases',
      label: 'Use Cases',
      children: [
        { id: 'use-session', label: 'Session storage' },
        { id: 'use-cache', label: 'Application caching' },
        { id: 'use-realtime', label: 'Real-time applications' }
      ]
    }
  ]
};