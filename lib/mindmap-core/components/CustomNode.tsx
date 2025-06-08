"use client"
import React from 'react';
import { Handle, Position } from '@xyflow/react';

export interface CustomNodeProps {
  data: {
    label: string;
    hasParent?: boolean;
    hasChildren?: boolean;
  };
}

/**
 * Custom node component with conditional handles based on connections
 */
export const CustomNode: React.FC<CustomNodeProps> = ({ data }) => {
  return (
    <>
      {data.hasParent && (
        <Handle type="target" position={Position.Left} id="left" />
      )}
      {data.hasChildren && (
        <Handle type="source" position={Position.Right} id="right" />
      )}
      <div 
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px 12px',
          boxSizing: 'border-box',
          textAlign: 'center',
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          hyphens: 'auto',
          whiteSpace: 'normal',
          fontSize: 'inherit',
          fontWeight: 'inherit',
          color: 'inherit'
        }}
        title={data.label} // Show full text on hover
      >
        {data.label}
      </div>
    </>
  );
};

export default CustomNode;