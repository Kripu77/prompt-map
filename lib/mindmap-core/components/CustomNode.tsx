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
      <div>{data.label}</div>
    </>
  );
};

export default CustomNode;