export function collectAllNodeIds(tree: unknown): Set<string> {
  const nodeIds = new Set<string>();
  
  const traverse = (node: unknown) => {
    if (!node || typeof node !== 'object' || !('id' in node)) return;
    
    const typedNode = node as { id: string; children?: unknown[] };
    nodeIds.add(typedNode.id);
    
    if (typedNode.children) {
      typedNode.children.forEach(traverse);
    }
  };
  
  traverse(tree);
  return nodeIds;
}

export function findNodeById(tree: unknown, nodeId: string): unknown | null {
  const findNode = (node: unknown): unknown => {
    if (!node || typeof node !== 'object' || !('id' in node)) return null;
    
    const typedNode = node as { id: string; children?: unknown[] };
    if (typedNode.id === nodeId) return node;
    
    if (typedNode.children) {
      for (const child of typedNode.children) {
        const found = findNode(child);
        if (found) return found;
      }
    }
    return null;
  };
  
  return findNode(tree);
}

export function getNodeLevel(tree: unknown, nodeId: string): number {
  const node = findNodeById(tree, nodeId);
  if (node && typeof node === 'object' && 'level' in node) {
    const typedNode = node as { level: number };
    return typedNode.level;
  }
  return 999;
}

export function sortNodesByLevel(tree: unknown, nodeIds: string[]): string[] {
  return nodeIds.sort((a, b) => getNodeLevel(tree, a) - getNodeLevel(tree, b));
}