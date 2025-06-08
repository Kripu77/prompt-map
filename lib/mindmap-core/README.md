# Mindmap Core

A modular React library for creating interactive mindmaps using ReactFlow and D3.js.

## Features

- 🌳 **D3 Tree Layout**: Hierarchical tree-based mindmap layout
- 🎨 **Customizable Styling**: Branch-specific colors and themes
- 🔗 **Interactive Connections**: Drag-and-drop node connections
- 📱 **Responsive Design**: Works on desktop and mobile
- 🎛️ **Built-in Controls**: Zoom, pan, minimap, and layout controls
- 🔧 **TypeScript Support**: Full type safety and IntelliSense

## Installation

```bash
npm install @xyflow/react d3-hierarchy
```

## Quick Start

```tsx
import React from 'react';
import { Mindmap } from './mindmap-core';

const App = () => {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Mindmap />
    </div>
  );
};

export default App;
```

## API Reference

### Mindmap Component

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `HierarchicalNode` | `DEFAULT_HIERARCHICAL_DATA` | The hierarchical data structure for the mindmap |
| `branchColors` | `BranchColors` | `DEFAULT_BRANCH_COLORS` | Color scheme for different branches |
| `className` | `string` | - | CSS class name for the container |
| `style` | `React.CSSProperties` | - | Inline styles for the container |
| `showControls` | `boolean` | `true` | Show ReactFlow controls (zoom, fit view, etc.) |
| `showMiniMap` | `boolean` | `true` | Show the minimap |
| `showBackground` | `boolean` | `true` | Show the grid background |
| `onNodeClick` | `(event, node) => void` | - | Callback when a node is clicked |
| `onEdgeClick` | `(event, edge) => void` | - | Callback when an edge is clicked |

### Data Structure

```tsx
interface HierarchicalNode {
  id: string;
  label: string;
  children?: HierarchicalNode[];
}
```

### Custom Colors

```tsx
interface BranchColor {
  primary: string;
  gradient: string;
  light: string;
}

type BranchColors = Record<string, BranchColor>;
```

## Examples

### Custom Data

```tsx
import { Mindmap, HierarchicalNode } from './mindmap-core';

const customData: HierarchicalNode = {
  id: 'root',
  label: 'My Project',
  children: [
    {
      id: 'frontend',
      label: 'Frontend',
      children: [
        { id: 'react', label: 'React' },
        { id: 'typescript', label: 'TypeScript' }
      ]
    },
    {
      id: 'backend',
      label: 'Backend',
      children: [
        { id: 'nodejs', label: 'Node.js' },
        { id: 'database', label: 'Database' }
      ]
    }
  ]
};

const App = () => {
  return <Mindmap data={customData} />;
};
```

### Custom Colors

```tsx
import { Mindmap, BranchColors } from './mindmap-core';

const customColors: BranchColors = {
  frontend: {
    primary: '#61dafb',
    gradient: 'linear-gradient(135deg, #61dafb 0%, #21759b 100%)',
    light: '#61dafbaa'
  },
  backend: {
    primary: '#68d391',
    gradient: 'linear-gradient(135deg, #68d391 0%, #38a169 100%)',
    light: '#68d391aa'
  }
};

const App = () => {
  return <Mindmap branchColors={customColors} />;
};
```

### Event Handling

```tsx
import { Mindmap } from './mindmap-core';
import { Node, Edge } from '@xyflow/react';

const App = () => {
  const handleNodeClick = (event: React.MouseEvent, node: Node) => {
    console.log('Node clicked:', node.data.label);
  };

  const handleEdgeClick = (event: React.MouseEvent, edge: Edge) => {
    console.log('Edge clicked:', edge.id);
  };

  return (
    <Mindmap
      onNodeClick={handleNodeClick}
      onEdgeClick={handleEdgeClick}
    />
  );
};
```

## Advanced Usage

### Using Layout Functions Directly

```tsx
import { createD3TreeLayout, HierarchicalNode } from './mindmap-core';

const data: HierarchicalNode = { /* your data */ };
const { nodes, edges } = createD3TreeLayout({ data });

// Use nodes and edges with ReactFlow directly
```

### Custom Node Component

```tsx
import { CustomNode, nodeTypes } from './mindmap-core';
import { ReactFlow } from '@xyflow/react';

// Use the exported nodeTypes or create your own
const customNodeTypes = {
  ...nodeTypes,
  myCustom: MyCustomNodeComponent
};

const App = () => {
  return (
    <ReactFlow nodeTypes={customNodeTypes}>
      {/* Your ReactFlow content */}
    </ReactFlow>
  );
};
```

## Dependencies

- `@xyflow/react`: ReactFlow library for node-based UIs
- `d3-hierarchy`: D3.js hierarchy utilities for tree layouts
- `react`: React library

