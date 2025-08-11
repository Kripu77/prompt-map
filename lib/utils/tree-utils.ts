export function collectAllNodeIds(tree: any): Set<string> {
  const nodeIds = new Set<string>();
  
  const traverse = (node: any) => {
    nodeIds.add(node.id);
    if (node.children) {
      node.children.forEach(traverse);
    }
  };
  
  traverse(tree);
  return nodeIds;
}

export function findNodeById(tree: any, nodeId: string): any | null {
  const findNode = (node: any): any => {
    if (node.id === nodeId) return node;
    if (node.children) {
      for (const child of node.children) {
        const found = findNode(child);
        if (found) return found;
      }
    }
    return null;
  };
  
  return findNode(tree);
}

export function getNodeLevel(tree: any, nodeId: string): number {
  const node = findNodeById(tree, nodeId);
  return node ? node.level : 999;
}

export function sortNodesByLevel(tree: any, nodeIds: string[]): string[] {
  return nodeIds.sort((a, b) => getNodeLevel(tree, a) - getNodeLevel(tree, b));
}