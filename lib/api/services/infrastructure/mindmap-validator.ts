export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface MindmapValidationOptions {
  maxNodes?: number;
  maxDepth?: number;
  requireCentralNode?: boolean;
}

export interface MindmapNode {
  id: string;
  label: string;
  level?: number;
  parentId?: string;
}

export interface MindmapEdge {
  source: string;
  target: string;
  label?: string;
}

export interface MindmapData {
  centralNode?: MindmapNode;
  nodes?: MindmapNode[];
  edges?: MindmapEdge[];
}

export class MindmapValidator {
  private static readonly DEFAULT_OPTIONS: Required<MindmapValidationOptions> = {
    maxNodes: 100,
    maxDepth: 5,
    requireCentralNode: true
  };

  static validateStructure(mindmapData: MindmapData, options: MindmapValidationOptions = {}): ValidationResult {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!mindmapData) {
      errors.push('Mindmap data is required');
      return { isValid: false, errors, warnings };
    }

    // Validate basic structure
    if (typeof mindmapData !== 'object') {
      errors.push('Mindmap data must be an object');
    }

    // Validate central node if required
    if (opts.requireCentralNode && !mindmapData.centralNode) {
      errors.push('Central node is required');
    }

    // Validate nodes array
    if (mindmapData.nodes && Array.isArray(mindmapData.nodes)) {
      if (mindmapData.nodes.length > opts.maxNodes) {
        warnings.push(`Too many nodes (${mindmapData.nodes.length}), consider simplifying`);
      }

      // Validate individual nodes
      mindmapData.nodes.forEach((node: MindmapNode, index: number) => {
        if (!node.id) {
          errors.push(`Node at index ${index} missing required 'id' field`);
        }
        if (!node.label) {
          errors.push(`Node at index ${index} missing required 'label' field`);
        }
      });
    }

    // Validate connections/edges
    if (mindmapData.edges && Array.isArray(mindmapData.edges)) {
      mindmapData.edges.forEach((edge: MindmapEdge, index: number) => {
        if (!edge.source) {
          errors.push(`Edge at index ${index} missing required 'source' field`);
        }
        if (!edge.target) {
          errors.push(`Edge at index ${index} missing required 'target' field`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static validatePrompt(prompt: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!prompt?.trim()) {
      errors.push('Prompt cannot be empty');
    } else {
      if (prompt.length < 10) {
        warnings.push('Prompt is very short, consider adding more detail');
      }
      if (prompt.length > 5000) {
        warnings.push('Prompt is very long, consider breaking it down');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static validateResponse(response: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!response?.trim()) {
      errors.push('Response cannot be empty');
      return { isValid: false, errors, warnings };
    }

    // Check if response looks like valid JSON or structured data
    try {
      JSON.parse(response);
    } catch {
      warnings.push('Response does not appear to be valid JSON');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}